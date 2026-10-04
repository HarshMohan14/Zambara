"""Convert a .dc.html Design Component into a React class component (TSX) + scoped CSS.

The template ({{holes}}, <sc-for>, <sc-if>) becomes JSX reading from `v = this.renderVals()`.
The logic class body is copied verbatim; DCLogic == React.Component.
"""
import re, sys, html as H

VOID = {'img', 'input', 'br', 'hr', 'source', 'meta', 'link', 'area', 'col', 'embed', 'track', 'wbr'}
HOLE = re.compile(r'\{\{\s*([^}]+?)\s*\}\}')
WHOLE = re.compile(r'^\s*\{\{\s*([^}]+?)\s*\}\}\s*$')
ATTR = re.compile(r'([A-Za-z_:][-A-Za-z0-9_:.]*)(?:\s*=\s*"([^"]*)")?')
TAG = re.compile(r'<!--.*?-->|<(/?)([A-Za-z][A-Za-z0-9-]*)((?:\s+[A-Za-z_:][-A-Za-z0-9_:.]*(?:\s*=\s*"[^"]*")?)*)\s*(/?)>', re.S)
RENAME = {'class': 'className', 'for': 'htmlFor', 'tabindex': 'tabIndex', 'readonly': 'readOnly', 'maxlength': 'maxLength',
          'autocomplete': 'autoComplete', 'enterkeyhint': 'enterKeyHint', 'inputmode': 'inputMode', 'srcset': 'srcSet',
          'crossorigin': 'crossOrigin', 'colspan': 'colSpan', 'rowspan': 'rowSpan', 'viewbox': 'viewBox'}


def camel(k):
    if k.startswith('--'):
        return k
    if k.startswith('-'):
        k = k[1:]
        out = re.sub(r'-([a-z])', lambda m: m.group(1).upper(), k)
        return out[0].upper() + out[1:]
    return re.sub(r'-([a-z])', lambda m: m.group(1).upper(), k)


class Conv:
    def __init__(self):
        self.scope = []  # loop variable names

    def expr(self, path):
        path = path.strip()
        if path in ('true', 'false') or re.fullmatch(r'-?\d+(\.\d+)?', path):
            return path
        parts = path.split('.')
        head = parts[0]
        if head == '$index':
            return '$index'
        base = head if head in self.scope else '__v.' + head
        out = base
        for p in parts[1:]:
            out += '?.' + p
        return out

    def interp(self, s):
        """string with holes -> JS template literal"""
        def rep(m):
            return '${S(' + self.expr(m.group(1)) + ')}'
        body = s.replace('\\', '\\\\').replace('`', '\\`')
        body = re.sub(r'\$\{', '\\${', body)
        body = HOLE.sub(rep, body)
        return '`' + body + '`'

    def attr_value(self, s):
        m = WHOLE.match(s)
        if m:
            return '{' + self.expr(m.group(1)) + '}'
        if '{{' in s:
            return '{' + self.interp(H.unescape(s)) + '}'
        return '{' + repr_js(H.unescape(s)) + '}'

    def style(self, s):
        props = []
        # split on ; not inside parentheses
        depth = 0; cur = ''
        decls = []
        for ch in s:
            if ch == '(':
                depth += 1
            elif ch == ')':
                depth -= 1
            if ch == ';' and depth == 0:
                decls.append(cur); cur = ''
            else:
                cur += ch
        decls.append(cur)
        for d in decls:
            if ':' not in d:
                continue
            k, val = d.split(':', 1)
            k = k.strip(); val = val.strip()
            if not k:
                continue
            key = camel(k)
            keyjs = repr_js(key) if key.startswith('--') else key
            m = WHOLE.match(val)
            if m:
                props.append(f'{keyjs}: {self.expr(m.group(1))}')
            elif '{{' in val:
                props.append(f'{keyjs}: {self.interp(H.unescape(val))}')
            else:
                props.append(f'{keyjs}: {repr_js(H.unescape(val))}')
        return '{{ ' + ', '.join(props) + ' }}'

    def text(self, t):
        if not t:
            return ''
        out = []
        pos = 0
        for m in HOLE.finditer(t):
            out.append(esc_text(t[pos:m.start()]))
            out.append('{' + self.expr(m.group(1)) + '}')
            pos = m.end()
        out.append(esc_text(t[pos:]))
        return ''.join(out)

    def convert(self, src):
        """returns JSX string"""
        out = []
        stack = []
        pos = 0
        for m in TAG.finditer(src):
            out.append(self.text(src[pos:m.start()]))
            pos = m.end()
            if m.group(0).startswith('<!--'):
                continue
            closing, name, attrs, selfclose = m.group(1), m.group(2), m.group(3), m.group(4)
            lname = name.lower()
            if closing:
                top = stack.pop()
                if top[0] != lname:
                    raise ValueError(f'mismatched </{name}> vs <{top[0]}>')
                if lname == 'sc-for':
                    out.append('</React.Fragment>))}')
                    self.scope.pop(); self.scope.pop()
                elif lname == 'sc-if':
                    out.append('</>) : null}')
                elif lname not in VOID:
                    out.append(f'</{top[1]}>')
                continue
            amap = [(a.group(1), a.group(2)) for a in ATTR.finditer(attrs)]
            if lname == 'sc-for':
                d = dict(amap)
                lst = WHOLE.match(d['list']).group(1)
                var = d.get('as', 'item')
                out.append('{(' + self.expr(lst) + ' || []).map((' + var + ': any, $index: number) => (<React.Fragment key={$index}>')
                self.scope.append(var); self.scope.append('$index')
                stack.append((lname, name))
                continue
            if lname == 'sc-if':
                d = dict(amap)
                cond = WHOLE.match(d['value']).group(1)
                out.append('{' + self.expr(cond) + ' ? (<>')
                stack.append((lname, name))
                continue
            parts = []
            for k, val in amap:
                if k.startswith('hint-'):
                    continue
                if val is None:
                    parts.append(RENAME.get(k, k)); continue
                if k == 'style':
                    parts.append('style=' + self.style(val)); continue
                kk = RENAME.get(k.lower(), k) if k.lower() in RENAME else k
                if '-' in kk and not (kk.startswith('aria-') or kk.startswith('data-')):
                    kk = camel(kk)
                if kk in ('muted', 'loop', 'playsInline', 'autoPlay', 'disabled', 'checked', 'required') and WHOLE.match(val or ''):
                    parts.append(f'{kk}={self.attr_value(val)}'); continue
                parts.append(f'{kk}={self.attr_value(val)}')
            tagname = name if name[0].isupper() else lname
            if lname in VOID or selfclose:
                out.append(f'<{tagname} ' + ' '.join(parts) + ' />')
            else:
                out.append(f'<{tagname}' + (' ' + ' '.join(parts) if parts else '') + '>')
                stack.append((lname, tagname))
        out.append(self.text(src[pos:]))
        if stack:
            raise ValueError('unclosed: ' + str(stack))
        return ''.join(out)


def esc_text(t):
    t = t.replace('{', '&#123;').replace('}', '&#125;').replace('>', '&gt;')
    return t


def repr_js(s):
    return "'" + s.replace('\\', '\\\\').replace("'", "\\'").replace('\n', '\\n') + "'"


def scope_css(css, scope):
    out = []
    i = 0
    n = len(css)
    while i < n:
        c = css[i]
        if c.isspace():
            out.append(c); i += 1; continue
        if css.startswith('/*', i):
            k = css.index('*/', i) + 2; out.append(css[i:k]); i = k; continue
        if c == '@':
            j = css.index('{', i)
            head = css[i:j]
            depth = 0; k = j
            while True:
                if css[k] == '{': depth += 1
                elif css[k] == '}':
                    depth -= 1
                    if depth == 0: break
                k += 1
            inner = css[j + 1:k]
            if head.startswith('@media') or head.startswith('@supports'):
                out.append(head + '{' + scope_css(inner, scope) + '}')
            else:
                out.append(css[i:k + 1])
            i = k + 1; continue
        j = css.index('{', i)
        k = css.index('}', j)
        sel = css[i:j].strip()
        sels = []
        for p in sel.split(','):
            p = p.strip()
            if p in ('body', 'html', ':root'):
                sels.append(scope)
            elif p.startswith('body '):
                sels.append(scope + ' ' + p[5:])
            else:
                sels.append(scope + ' ' + p)
        out.append(','.join(sels) + css[j:k + 1])
        i = k + 1
    return ''.join(out)


def convert_file(path, comp_name, scope_cls, header_imports=''):
    s = open(path).read()
    tpl_start = s.index('</helmet>') + len('</helmet>')
    tpl_end = s.index('</x-dc>')
    tpl = s[tpl_start:tpl_end].strip()
    css = re.search(r'<style>\n?(.*?)</style>', s, re.S).group(1)
    script = re.search(r'<script type="text/x-dc"[^>]*>(.*?)</script>', s, re.S).group(1)
    body = script.strip()
    assert body.startswith('class Component extends DCLogic {')
    body = body[len('class Component extends DCLogic {'):].rstrip()
    assert body.endswith('}')
    body = body[:-1]
    jsx = Conv().convert(tpl)
    tsx = f"""// @ts-nocheck
/* eslint-disable */
// AUTO-GENERATED from design/prototypes by scripts/cinematic/gen.sh — edit the prototype + patch script, then regenerate.
'use client'
import React from 'react'
{header_imports}
const S = (x: any) => (x == null ? '' : String(x))

export default class {comp_name} extends React.Component<any, any> {{
{body}
  render() {{
    const __v: any = this.renderVals()
    return (
<>{jsx}</>
    )
  }}
}}
"""
    return tsx, scope_css(css, '.' + scope_cls)


if __name__ == '__main__':
    src, name, scope, out_tsx, out_css = sys.argv[1:6]
    imports = open(sys.argv[6]).read() if len(sys.argv) > 6 else ''
    tsx, css = convert_file(src, name, scope, imports)
    open(out_tsx, 'w').write(tsx)
    open(out_css, 'w').write(css)
    print('ok', out_tsx, len(tsx), out_css, len(css))
