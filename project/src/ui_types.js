// @flow

class KeyDownEvent {
    +key: string;
    +type: "KeyDownEvent";
    constructor(key: string): void {this.key = key; this.type = "KeyDownEvent";}
}
class KeyUpEvent {
    +key: string;
    +type: "KeyUpEvent";
    constructor(key: string): void {this.key = key; this.type = "KeyUpEvent";}
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
