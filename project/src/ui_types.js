// @flow

class KeyDownEvent {
    +key: string;
    constructor(key: string): void {this.key = key;}
}
class KeyUpEvent {
    +key: string;
    constructor(key: string): void {this.key = key;}
}
class TickEvent {
    +time: number;
    constructor(time: number): void {this.time = time;}
}

module.exports = {KeyDownEvent, KeyUpEvent, TickEvent};

export type Event =
    KeyDownEvent |
    KeyUpEvent |
    TickEvent;
