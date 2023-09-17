export class EventCache {
  private _events: { id: string; args: any }[] = []

  public get(id: string): any {
    const one = this._events.find((e) => e.id === id)
    if (one) {
      const index = this._events.indexOf(one)
      this._events.splice(index, 1)
      return one.args
    } else {
      return null
    }
  }

  public add(id: string, args: any): void {
    this._events.push({ id, args })
  }
}
