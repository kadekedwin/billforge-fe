export class EscPosEncoder {
    private buffer: number[] = [];

    initialize() {
        this.buffer.push(0x1B, 0x40); // ESC @
        return this;
    }

    text(content: string) {
        // Simple text encoding, might need expanded char support later
        for (let i = 0; i < content.length; i++) {
            this.buffer.push(content.charCodeAt(i));
        }
        return this;
    }

    newline() {
        this.buffer.push(0x0A);
        return this;
    }

    align(align: 'left' | 'center' | 'right') {
        this.buffer.push(0x1B, 0x61); // ESC a
        switch (align) {
            case 'center':
                this.buffer.push(1);
                break;
            case 'right':
                this.buffer.push(2);
                break;
            default: // left
                this.buffer.push(0);
                break;
        }
        return this;
    }

    bold(enable: boolean) {
        this.buffer.push(0x1B, 0x45, enable ? 1 : 0); // ESC E
        return this;
    }

    size(width: 1 | 2, height: 1 | 2) {
        // GS ! n
        // 0 = normal, 16 = double height, 32 = double width, 48 = double both
        // simplified logic for 1x or 2x
        let n = 0;
        if (width === 2) n += 32;
        if (height === 2) n += 16;
        this.buffer.push(0x1D, 0x21, n);
        return this;
    }

    qrcode(data: string, size: number = 6) {
        // ESC/POS QR Code commands (GS ( k)
        // Model 2, size, error correction level L

        const dataLength = data.length;
        const pL = (dataLength + 3) % 256;
        const pH = Math.floor((dataLength + 3) / 256);

        // Function 165: Store QR code data
        this.buffer.push(0x1D, 0x28, 0x6B, pL, pH, 0x31, 0x50, 0x30);

        // Add data
        for (let i = 0; i < data.length; i++) {
            this.buffer.push(data.charCodeAt(i));
        }

        // Function 167: Set QR code size (1-16)
        this.buffer.push(0x1D, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x43, Math.min(16, Math.max(1, size)));

        // Function 169: Set error correction level (48=L, 49=M, 50=Q, 51=H)
        this.buffer.push(0x1D, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x45, 0x30);

        // Function 180: Print QR code
        this.buffer.push(0x1D, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x51, 0x30);

        return this;
    }

    image(bitmap: number[], width: number) {
        const height = bitmap.length / Math.ceil(width / 8);
        const bytesPerLine = Math.ceil(width / 8);

        const xL = width % 256;
        const xH = Math.floor(width / 256);
        const yL = height % 256;
        const yH = Math.floor(height / 256);

        this.buffer.push(0x1D, 0x76, 0x30, 0x00, xL, xH, yL, yH);
        this.buffer.push(...bitmap);

        return this;
    }

    cut() {
        this.buffer.push(0x1D, 0x56, 66, 0); // GS V B 0 (feeds paper then cuts)
        return this;
    }

    // Add raw bytes
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

    // Helper to get hex string for debugging/sending via websocket if needed
    toHexString(): string {
        return this.buffer.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    // Helper to get base64 string
    toBase64(): string {
        // Convert number array to bytes
        const bytes = new Uint8Array(this.buffer);
        let binary = '';
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    }
}
