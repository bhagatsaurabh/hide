type Listener = (payload: unknown) => void;

class BufferedEventBus {
  private listeners = new Map<string, Listener[]>();
  private buffer = new Map<string, unknown[]>();

  on(event: string, listener: Listener) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(listener);

    if (this.buffer.has(event)) {
      for (const payload of this.buffer.get(event)!) {
        listener(payload);
      }
      this.buffer.delete(event);
    }
  }

  off(event: string, listener: Listener) {
    if (!this.listeners.has(event)) return;
    this.listeners.set(
      event,
      this.listeners.get(event)!.filter((l) => l !== listener)
    );
  }

  emit(event: string, payload: unknown) {
    const ls = this.listeners.get(event);
    if (!ls || ls.length === 0) {
      if (!this.buffer.has(event)) this.buffer.set(event, []);
      this.buffer.get(event)!.push(payload);
      return;
    }

    for (const listener of ls) {
      listener(payload);
    }
  }
}

export default new BufferedEventBus();
