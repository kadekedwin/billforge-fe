export class EscPosEncoder {
    private buffer: number[] = [];

    initialize() {
        this.buffer.push(0x1B, 0x40);
        return this;
    }

    text(content: string) {
        for (let i = 0; i < content.length; i++) {
            this.buffer.push(content.charCodeAt(i));
        }
        return this;
    }

    leftRight(left: string, right: string, width: number = 48) {
        const padding = Math.max(1, width - left.length - right.length);
        const content = left + ' '.repeat(padding) + right;
        return this.text(content);
    }

    newline() {
        this.buffer.push(0x0A);
        return this;
    }

    align(align: 'left' | 'center' | 'right') {
        this.buffer.push(0x1B, 0x61);
        switch (align) {
            case 'center':
                this.buffer.push(1);
                break;
            case 'right':
                this.buffer.push(2);
                break;
            default:
                this.buffer.push(0);
                break;
        }
        return this;
    }

    bold(enable: boolean) {
        this.buffer.push(0x1B, 0x45, enable ? 1 : 0);
        return this;
    }

    size(width: 1 | 2, height: 1 | 2) {
        let n = 0;
        if (width === 2) n += 32;
        if (height === 2) n += 16;
        this.buffer.push(0x1D, 0x21, n);
        return this;
    }

    delay(milliseconds: number) {
        const duration = Math.min(255, Math.max(0, Math.floor(milliseconds)));
        this.buffer.push(0x1B, 0x7E, 0x44, duration);
        return this;
    }

    line(char: string = '-', width: number = 48) {
        return this.text(char.repeat(width));
    }

    qrcode(data: string, size: number = 6) {
        const dataLength = data.length;
        const pL = (dataLength + 3) % 256;
        const pH = Math.floor((dataLength + 3) / 256);

        this.buffer.push(0x1D, 0x28, 0x6B, pL, pH, 0x31, 0x50, 0x30);

        for (let i = 0; i < data.length; i++) {
            this.buffer.push(data.charCodeAt(i));
        }

        this.buffer.push(0x1D, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x43, Math.min(16, Math.max(1, size)));

        this.buffer.push(0x1D, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x45, 0x30);

        this.buffer.push(0x1D, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x51, 0x30);

        return this;
    }

    image(bitmap: number[], width: number) {
        const bytesPerLine = Math.ceil(width / 8);
        const height = Math.floor(bitmap.length / bytesPerLine);

        for (let y = 0; y < height; y += 24) {
            const sliceHeight = Math.min(24, height - y);

            this.buffer.push(0x1D, 0x76, 0x30, 0x00);
            this.buffer.push(bytesPerLine & 0xFF, (bytesPerLine >> 8) & 0xFF);
            this.buffer.push(sliceHeight & 0xFF, (sliceHeight >> 8) & 0xFF);

            for (let sy = 0; sy < sliceHeight; sy++) {
                const lineIndex = (y + sy) * bytesPerLine;
                for (let x = 0; x < bytesPerLine; x++) {
                    this.buffer.push(bitmap[lineIndex + x] || 0);
                }
            }
        }

        return this;
    }

    cut() {
        this.buffer.push(0x1D, 0x56, 66, 0);
        return this;
    }

    raw(data: number[]) {
        this.buffer.push(...data);
        return this;
    }

    getData(): number[] {
        return this.buffer;
    }

    encode(): Uint8Array {
        return new Uint8Array(this.buffer);
    }

    toHexString(): string {
        return this.buffer.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    toBase64(): string {
        const bytes = new Uint8Array(this.buffer);
        let binary = '';
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    }
}
