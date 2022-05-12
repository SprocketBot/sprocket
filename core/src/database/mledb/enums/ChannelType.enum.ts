export enum ChannelType {
    // Special Cases
    // These are either abstract or hard-coded
    DIRECT_MESSAGE = 0,
    FALLBACK = 1,

    // Concrete Channel Types
    // i.e. #looking-for-game
    GENERAL = 2,
    DEBUG = 3,

    // Scrim Channel Types
    // Used for queuing / signing up / reporting
    OPEN_SCRIMS_DEFAULT = 4,
    PENDING_SCRIMS_DEFAULT = 5,
    REPORT_CARD_DEFAULT = 10,
    OPEN_SCRIMS_FOUNDATION,
    PENDING_SCRIMS_FOUNDATION,
    OPEN_SCRIMS_ACADEMY,
    PENDING_SCRIMS_ACADEMY,
    OPEN_SCRIMS_CHAMPION,
    PENDING_SCRIMS_CHAMPION,
    OPEN_SCRIMS_MASTER,
    PENDING_SCRIMS_MASTER,
    OPEN_SCRIMS_PREMIER,
    PENDING_SCRIMS_PREMIER,
    // add enums here for League_Report_Card_Foundation, assign a value start at 21
    LEAGUE_REPORT_CARD_FOUNDATION = 21,
    LEAGUE_REPORT_CARD_ACADEMY = 22,
    LEAGUE_REPORT_CARD_CHAMPION = 23,
    LEAGUE_REPORT_CARD_MASTER = 24,
    LEAGUE_REPORT_CARD_PREMIER = 25,
    TRANSACTIONS = 6,

    MATCH_TIMES = 99,
    LO_NOTIFS = 100,
}
