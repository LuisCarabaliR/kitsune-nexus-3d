export type PlazaCameraPose = {
  position: [number, number, number]
  target: [number, number, number]
}

export function plazaCameraPose(explorerPosition: [number, number, number]): PlazaCameraPose {
  const [x, , z] = explorerPosition
  return {
    position: [x, 9.5, z + 19.5],
    target: [x, 0.25, z - 4.5],
  }
}
