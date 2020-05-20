import React, { useMemo } from 'react'
import { ReactThreeFiber } from 'react-three-fiber'
import Vector, { VectorProps } from './Vector'
import { addVectors } from '../shared'

type VectorOpProps = {
    op: 'add'
    vector1: ReactThreeFiber.Vector3
    vector2: ReactThreeFiber.Vector3
    label_transform?: string
} & Omit<VectorProps, 'vector'>

const VectorOp: React.FC<VectorOpProps> = ({
    vector1,
    vector2,
    op,
    label_transform,
    ...rest
}) => {
    let labelStyle: React.CSSProperties = {}
    if (label_transform) {
        labelStyle = {
            position: 'absolute',
            transform: label_transform,
            opacity: 'opacity' in rest ? rest['opacity'] : 1,
        }
    }

    const vector = useMemo(() => {
        if (op === 'add') {
            return addVectors(vector1, vector2)
        }
    }, [vector1, vector2, op])

    return (
        <>
            <Vector vector={vector} {...rest} labelStyle={labelStyle} />
        </>
    )
}

export default VectorOp
