"use client";

import { useMemo } from "react";

interface MapThumbnailProps {
    lat: number;
    lon: number;
    zoom?: number;
}

function latLonToTile(lat: number, lon: number, z: number) {
    const n = 2 ** z;
    const xf = ((lon + 180) / 360) * n;
    const latRad = (lat * Math.PI) / 180;
    const yf =
        (1 -
            Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) /
        2 *
        n;
    return {
        x: Math.floor(xf),
        y: Math.floor(yf),
        xpx: (xf % 1) * 256,
        ypx: (yf % 1) * 256,
    };
}

const SUBDOMAINS = ["a", "b", "c"];

export default function MapThumbnail({ lat, lon, zoom = 15 }: MapThumbnailProps) {
    const { x, y, xpx, ypx } = useMemo(
        () => latLonToTile(lat, lon, zoom),
        [lat, lon, zoom]
    );

    const tiles = useMemo(() => {
        const list = [];
        for (let row = -1; row <= 1; row++) {
            for (let col = -1; col <= 1; col++) {
                const tx = x + col;
                const ty = y + row;
                const sub = SUBDOMAINS[Math.abs(tx + ty) % 3];
                list.push({
                    key: `${row}-${col}`,
                    src: `https://${sub}.tile.openstreetmap.org/${zoom}/${tx}/${ty}.png`,
                    left: (col + 1) * 256,
                    top: (row + 1) * 256,
                });
            }
        }
        return list;
    }, [x, y, zoom]);

    // Translate the 768×768 grid so the lat/lon pixel sits at the container's center
    const gridLeft = Math.round(256 + xpx);
    const gridTop = Math.round(256 + ypx);

    return (
        <div
            className="relative w-full h-full overflow-hidden bg-gray-100"
            style={{ pointerEvents: "none", userSelect: "none" }}
        >
            {/* 3×3 tile grid */}
            <div
                style={{
                    position: "absolute",
                    left: `calc(50% - ${gridLeft}px)`,
                    top: `calc(50% - ${gridTop}px)`,
                    width: 768,
                    height: 768,
                }}
            >
                {tiles.map(({ key, src, left, top }) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        key={key}
                        src={src}
                        alt=""
                        draggable={false}
                        style={{
                            position: "absolute",
                            left,
                            top,
                            width: 256,
                            height: 256,
                        }}
                    />
                ))}
            </div>

            {/* Pin marker */}
            <div
                style={{
                    position: "absolute",
                    left: "50%",
                    top: "50%",
                    transform: "translate(-50%, -100%)",
                    filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.35))",
                    zIndex: 1,
                }}
            >
                <svg
                    width="22"
                    height="30"
                    viewBox="0 0 22 30"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M11 0C4.925 0 0 4.925 0 11c0 7.7 11 19 11 19S22 18.7 22 11C22 4.925 17.075 0 11 0z"
                        fill="#2563eb"
                    />
                    <circle cx="11" cy="11" r="4" fill="white" />
                </svg>
            </div>

            {/* Attribution */}
            <span
                style={{
                    position: "absolute",
                    bottom: 3,
                    right: 5,
                    fontSize: 9,
                    color: "rgba(0,0,0,0.55)",
                    zIndex: 1,
                    lineHeight: 1,
                }}
            >
                © OpenStreetMap
            </span>
        </div>
    );
}
