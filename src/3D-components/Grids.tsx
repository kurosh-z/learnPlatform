/* eslint-disable @typescript-eslint/no-namespace */
import React, { useMemo, useEffect } from 'react'
import { scaleLinear, ScaleLinear } from 'd3-scale'
import * as THREE from 'three'
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry'
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial'
import { Line2 } from 'three/examples/jsm/lines/Line2.js'
import { ReactThreeFiber, useThree, extend } from 'react-three-fiber'

// extending the line2 to be used in react-fiber
extend({ LineMaterial, LineGeometry, Line2 })
declare global {
    namespace JSX {
        interface IntrinsicElements {
            line2: ReactThreeFiber.Object3DNode<Line2, typeof Line2>
            lineMaterial: ReactThreeFiber.Object3DNode<
                LineMaterial,
                typeof LineMaterial
            >
            lineGeometry: ReactThreeFiber.Object3DNode<
                LineGeometry,
                typeof LineGeometry
            >
        }
    }
}
// Grids
interface GridProps {
    type?: 'xy' | 'xz' | 'yz'
    len1?: number
    len2?: number
    scale: ScaleLinear<number, number>
}

const Grids: React.FC<GridProps> = ({
    type = 'xy',
    len1 = 20,
    len2 = 20,
    scale,
}) => {
    const { pointsArray1, pointsArray2 } = useMemo(() => {
        const pointsArray1 = []
        const pointsArray2 = []
        const halflen1 = len1 / 2
        const halflen2 = len2 / 2
        const dist = 1
        // vertical lines
        for (
            let i = scale(-halflen1 + dist);
            i < scale(halflen1);
            i += scale(dist)
        ) {
            // prettier-ignore
            const linePoints1 = [ i, scale(halflen2), 0.001, i, scale(-halflen2), 0.001]
            pointsArray1.push(linePoints1)
        }
        for (
            let j = scale(-halflen2 + dist);
            j < scale(halflen2);
            j += scale(dist)
        ) {
            // prettier-ignore
            const linePoints2 = [scale(halflen1), j, 0.001, scale(-halflen1), j, 0.001];
            pointsArray2.push(linePoints2)
        }

        return { pointsArray1, pointsArray2 }
    }, [type, len1, len2])
    const { size } = useThree()

    const gridlines1 = useMemo(() => {
        return pointsArray1.map((linePoints, idx) => {
            return (
                <line2 key={idx}>
                    <lineGeometry
                        attach="geometry"
                        onUpdate={(self: LineGeometry) => {
                            self.setPositions(linePoints)
                        }}
                    />
                    <lineMaterial
                        attach="material"
                        args={[
                            {
                                color: 'gray',
                                linewidth: 1,
                                resolution: new THREE.Vector2(
                                    size.width,
                                    size.height
                                ),
                            },
                        ]}
                    />
                </line2>
            )
        })
    }, [pointsArray1])

    const gridlines2 = useMemo(() => {
        return pointsArray2.map((linePoints, idx) => {
            return (
                <line2 key={idx}>
                    <lineGeometry
                        attach="geometry"
                        onUpdate={(self: LineGeometry) => {
                            self.setPositions(linePoints)
                        }}
                    />
                    <lineMaterial
                        attach="material"
                        args={[
                            {
                                color: '#9d9e9e',
                                linewidth: 0.5,
                                resolution: new THREE.Vector2(
                                    size.width,
                                    size.height
                                ),
                            },
                        ]}
                    />
                </line2>
            )
        })
    }, [pointsArray2])
    return (
        <group>
            {gridlines1}
            {gridlines2}
        </group>
    )
}

export default Grids
