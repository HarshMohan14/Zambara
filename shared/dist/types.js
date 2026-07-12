export var PlayerRole;
(function (PlayerRole) {
    PlayerRole["Civilian"] = "Civilian";
    PlayerRole["Attacker"] = "Attacker";
    PlayerRole["RescueOfficer"] = "RescueOfficer";
})(PlayerRole || (PlayerRole = {}));
export var PlayerStatus;
(function (PlayerStatus) {
    PlayerStatus["Active"] = "Active";
    PlayerStatus["Hidden"] = "Hidden";
    PlayerStatus["Captured"] = "Captured";
    PlayerStatus["Extracted"] = "Extracted";
    PlayerStatus["Neutralised"] = "Neutralised";
})(PlayerStatus || (PlayerStatus = {}));
export var MatchPhase;
(function (MatchPhase) {
    MatchPhase["Lobby"] = "Lobby";
    MatchPhase["CivilianPreparation"] = "CivilianPreparation";
    MatchPhase["AttackerEntry"] = "AttackerEntry";
    MatchPhase["RescuePhase"] = "RescuePhase";
    MatchPhase["MatchEnd"] = "MatchEnd";
})(MatchPhase || (MatchPhase = {}));
export var DoorState;
(function (DoorState) {
    DoorState["Open"] = "Open";
    DoorState["Closed"] = "Closed";
    DoorState["Locked"] = "Locked";
    DoorState["Broken"] = "Broken";
})(DoorState || (DoorState = {}));
