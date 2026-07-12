declare module 'snappyjs' {
    export function compress<T extends ArrayBuffer | Uint8Array>(input: T): T;
    export function uncompress<T extends ArrayBuffer | Uint8Array>(compressed: T, maxLength?: number): T;
}
