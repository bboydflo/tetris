export enum Key {
    ESC = 'ESC',
    SPACE = 'SPACE#',
    LEFT = 'LEFT',
    UP = 'UP',
    RIGHT = 'RIGHT',
    DOWN = 'DOWN',
    P = 'P',
    Q = 'Q'
}

export const browserKeyCodeMap = {
    27: Key.ESC,
    32: Key.SPACE,
    37: Key.LEFT,
    38: Key.UP,
    39: Key.RIGHT,
    40: Key.DOWN,
    80: Key.P,
    81: Key.Q
} as const
