import { createMemo, flush, Loading } from "solid-js"
import { render } from "@solidjs/web"
import { describe, expect, test } from "vitest"
import { Collapsible, CollapsiblePanel } from "../src/collapsible"
import { Popover, PopoverContent } from "../src/popover"
import { Switch } from "../src/switch"

const tick = () => new Promise((resolve) => setTimeout(resolve, 20))

function mount(code: () => any) {
  const root = document.createElement("div")
  document.body.append(root)
  const dispose = render(code, root)
  flush()
  return { root, dispose }
}

function source() {
  let emit = (_: boolean) => {}
  let made = 0
  const create = () =>
    createMemo(() => {
      made++
      return {
        [Symbol.asyncIterator]: () => ({
          next: () =>
            new Promise<IteratorResult<boolean>>((resolve) => {
              emit = (value) => resolve({ done: false, value })
            }),
          return: () =>
            Promise.resolve({ done: true as const, value: undefined }),
        }),
      } as unknown as boolean
    })
  return { create, emit: (value: boolean) => emit(value), made: () => made }
}

describe("a controlled input that has not produced yet", () => {
  test.each([
    [
      "Switch",
      (value: () => boolean) => (
        <Switch checked={value()} aria-label="Notifications" />
      ),
    ],
    [
      "Collapsible",
      (value: () => boolean) => (
        <Collapsible open={value()}>
          <CollapsiblePanel>Panel</CollapsiblePanel>
        </Collapsible>
      ),
    ],
    [
      "Popover",
      (value: () => boolean) => (
        <Popover open={value()}>
          <PopoverContent>Popup</PopoverContent>
        </Popover>
      ),
    ],
  ])("suspends at the %s root and renders once it arrives", async (_, root) => {
    const input = source()
    function Editor() {
      const value = input.create()
      return root(value)
    }
    const { root: host, dispose } = mount(() => (
      <Loading fallback="Waiting">
        <Editor />
      </Loading>
    ))
    await tick()
    expect(host.textContent).toBe("Waiting")
    input.emit(true)
    await tick()
    await tick()
    expect(host.textContent).not.toBe("Waiting")
    expect(input.made()).toBe(1)
    dispose()
  })
})
