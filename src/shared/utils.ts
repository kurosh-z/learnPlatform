import { Vector3 } from 'three'

type VectorArg = [number, number, number]

export function sMultiply(a: number, v: VectorArg) {
    const vector = []
    for (const el of v) {
        vector.push(a * el)
    }

    return vector as VectorArg
}

export function addVectors(
    vector1: [number, number, number] | THREE.Vector3,
    vector2: [number, number, number] | THREE.Vector3,
    arrayOutput = false
) {
    const _vector1 =
        vector1 instanceof Vector3 ? vector1 : new Vector3(...vector1)
    const _vector2 =
        vector2 instanceof Vector3 ? vector2 : new Vector3(...vector2)
    const res = new Vector3()
    if (arrayOutput)
        res.addVectors(_vector1, _vector2).toArray() as [number, number, number]

    return res.addVectors(_vector1, _vector2)
}
