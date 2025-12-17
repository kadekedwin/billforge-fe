'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
    getPrinterSettings,
    createPrinterSettings,
    updatePrinterSettings,
} from '@/lib/api/printer-settings';

interface UsePrinterSettingsProps {
    businessUuid: string | null;
}

export function usePrinterSettings({ businessUuid }: UsePrinterSettingsProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const isLoadingRef = useRef(false);

    const [paperWidthMm, setPaperWidthMm] = useState<number>(80);
    const [charsPerLine, setCharsPerLine] = useState<number>(48);
    const [encoding, setEncoding] = useState<string>('UTF-8');
    const [feedLines, setFeedLines] = useState<number>(3);
    const [cutEnabled, setCutEnabled] = useState<boolean>(true);

    const loadPrinterSettings = useCallback(async () => {
        if (!businessUuid || isLoadingRef.current) {
            setIsLoading(false);
            return;
        }

        try {
            isLoadingRef.current = true;
            setIsLoading(true);
            setError(null);

            try {
                const response = await getPrinterSettings(businessUuid);

                if (response.success && response.data) {
                    const data = response.data;
                    setPaperWidthMm(data.paper_width_mm);
                    setCharsPerLine(data.chars_per_line);
                    setEncoding(data.encoding);
                    setFeedLines(data.feed_lines || 3);
                    setCutEnabled(data.cut_enabled ?? true);
                }
            } catch (error: unknown) {
                // Check if error is an object and has statusCode property
                if (typeof error === 'object' && error !== null && 'statusCode' in error && (error as { statusCode: number }).statusCode === 404) {
                    const createResponse = await createPrinterSettings(businessUuid, {
                        paper_width_mm: 80,
                        chars_per_line: 48,
                        encoding: 'UTF-8',
                        feed_lines: 3,
                        cut_enabled: true,
                    });

                    if (createResponse.success && createResponse.data) {
                        const data = createResponse.data;
                        setPaperWidthMm(data.paper_width_mm);
                        setCharsPerLine(data.chars_per_line);
                        setEncoding(data.encoding);
                        setFeedLines(data.feed_lines || 3);
                        setCutEnabled(data.cut_enabled ?? true);
                    } else {
                        setError('Failed to create printer settings');
                    }
                } else {
                    throw error;
                }
            }
        } catch (err) {
            console.error('Error loading printer settings:', err);
            setError('Failed to load printer settings');
        } finally {
            setIsLoading(false);
            isLoadingRef.current = false;
        }
    }, [businessUuid]);

    useEffect(() => {
        loadPrinterSettings();
    }, [loadPrinterSettings]);

    const updatePaperWidthMm = async (value: number) => {
        if (!businessUuid) return;

        setPaperWidthMm(value);

        try {
            await updatePrinterSettings(businessUuid, {
                paper_width_mm: value,
            });
        } catch (err) {
            console.error('Error updating paper width:', err);
            setError('Failed to update paper width');
        }
    };

    const updateCharsPerLine = async (value: number) => {
        if (!businessUuid) return;

        setCharsPerLine(value);

        try {
            await updatePrinterSettings(businessUuid, {
                chars_per_line: value,
            });
        } catch (err) {
            console.error('Error updating chars per line:', err);
            setError('Failed to update chars per line');
        }
    };

    const updateEncoding = async (value: string) => {
        if (!businessUuid) return;

        setEncoding(value);

        try {
            await updatePrinterSettings(businessUuid, {
                encoding: value,
            });
        } catch (err) {
            console.error('Error updating encoding:', err);
            setError('Failed to update encoding');
        }
    };

    const updateFeedLines = async (value: number) => {
        if (!businessUuid) return;

        setFeedLines(value);

        try {
            await updatePrinterSettings(businessUuid, {
                feed_lines: value,
            });
        } catch (err) {
            console.error('Error updating feed lines:', err);
            setError('Failed to update feed lines');
        }
    };

    const updateCutEnabled = async (value: boolean) => {
        if (!businessUuid) return;

        setCutEnabled(value);

        try {
            await updatePrinterSettings(businessUuid, {
                cut_enabled: value,
            });
        } catch (err) {
            console.error('Error updating cut enabled:', err);
            setError('Failed to update cut enabled');
        }
    };

    return {
        isLoading,
        error,
        paperWidthMm,
        updatePaperWidthMm,
        charsPerLine,
        updateCharsPerLine,
        encoding,
        updateEncoding,
        feedLines,
        updateFeedLines,
        cutEnabled,
        updateCutEnabled,
    };
}
