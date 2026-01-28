// ====================
// PULSE V2 - TOON Data Exchange
// Εισαγωγή/Εξαγωγή δεδομένων σε TOON format
// ====================

// --- TOON Parser Interface ---
// Το TOON (Token-Oriented Object Notation) είναι ένα compact format 
// που εξοικονομεί tokens κατά ~40% σε σχέση με το JSON

export interface TOONData {
    version: string;
    exportedAt: string;
    entries: unknown[];
    routines: unknown[];
    settings: Record<string, unknown>;
}

// --- JSON to TOON conversion ---
// Για τώρα χρησιμοποιούμε ένα simplified TOON-like format
// που είναι human-readable και AI-friendly

export const jsonToTOON = (data: TOONData): string => {
    const lines: string[] = [];

    // Header
    lines.push(`# PULSE Data Export v${data.version}`);
    lines.push(`# Exported: ${data.exportedAt}`);
    lines.push('');

    // Entries Section
    lines.push('## ENTRIES');
    data.entries.forEach((entry: any, index) => {
        lines.push(`[${index}]`);
        lines.push(`  date: ${entry.date}`);
        lines.push(`  course: ${entry.course}`);
        lines.push(`  hours: ${entry.hours}`);
        lines.push(`  tag: ${entry.tag}`);
        lines.push(`  startTime: ${entry.startTime}`);
        lines.push(`  endTime: ${entry.endTime}`);
        if (entry.notes) lines.push(`  notes: ${entry.notes}`);
        if (entry.focusScore) lines.push(`  focusScore: ${entry.focusScore}`);
        lines.push(`  id: ${entry.id}`);
        lines.push('');
    });

    // Routines Section
    lines.push('## ROUTINES');
    data.routines.forEach((routine: any, index) => {
        lines.push(`[${index}]`);
        lines.push(`  name: ${routine.name}`);
        lines.push(`  course: ${routine.course}`);
        lines.push(`  tag: ${routine.tag}`);
        lines.push(`  scheduledTime: ${routine.scheduledTime}`);
        lines.push(`  duration: ${routine.duration}`);
        lines.push(`  daysOfWeek: ${routine.daysOfWeek?.join(',')}`);
        lines.push(`  isActive: ${routine.isActive}`);
        lines.push(`  id: ${routine.id}`);
        lines.push('');
    });

    // Settings Section
    lines.push('## SETTINGS');
    Object.entries(data.settings).forEach(([key, value]) => {
        if (typeof value === 'object') {
            lines.push(`${key}: ${JSON.stringify(value)}`);
        } else {
            lines.push(`${key}: ${value}`);
        }
    });

    return lines.join('\n');
};

// --- TOON to JSON parsing ---
export const toonToJSON = (toon: string): TOONData => {
    const data: TOONData = {
        version: '2.0',
        exportedAt: new Date().toISOString(),
        entries: [],
        routines: [],
        settings: {}
    };

    const lines = toon.split('\n');
    let currentSection = '';
    let currentItem: Record<string, any> = {};

    for (const line of lines) {
        const trimmed = line.trim();

        // Skip comments and empty lines
        if (trimmed.startsWith('#') || trimmed === '') {
            // Extract version from header
            if (trimmed.includes('v')) {
                const match = trimmed.match(/v(\d+\.\d+)/);
                if (match) data.version = match[1];
            }
            continue;
        }

        // Section headers
        if (trimmed.startsWith('## ')) {
            // Save current item if exists
            if (Object.keys(currentItem).length > 0) {
                if (currentSection === 'ENTRIES') data.entries.push(currentItem);
                if (currentSection === 'ROUTINES') data.routines.push(currentItem);
            }
            currentSection = trimmed.replace('## ', '');
            currentItem = {};
            continue;
        }

        // New item
        if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
            if (Object.keys(currentItem).length > 0) {
                if (currentSection === 'ENTRIES') data.entries.push(currentItem);
                if (currentSection === 'ROUTINES') data.routines.push(currentItem);
            }
            currentItem = {};
            continue;
        }

        // Key-value pairs
        const colonIndex = trimmed.indexOf(':');
        if (colonIndex > 0) {
            const key = trimmed.substring(0, colonIndex).trim();
            let value: any = trimmed.substring(colonIndex + 1).trim();

            // Parse value types
            if (value === 'true') value = true;
            else if (value === 'false') value = false;
            else if (!isNaN(Number(value)) && value !== '') value = Number(value);
            else if (value.startsWith('{') || value.startsWith('[')) {
                try { value = JSON.parse(value); } catch { }
            }
            else if (key === 'daysOfWeek' && value.includes(',')) {
                value = value.split(',').map(Number);
            }

            if (currentSection === 'SETTINGS') {
                data.settings[key] = value;
            } else {
                currentItem[key] = value;
            }
        }
    }

    // Don't forget the last item
    if (Object.keys(currentItem).length > 0) {
        if (currentSection === 'ENTRIES') data.entries.push(currentItem);
        if (currentSection === 'ROUTINES') data.routines.push(currentItem);
    }

    return data;
};

// --- Validation ---
export const validateTOON = (toon: string): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!toon.includes('## ENTRIES')) {
        errors.push('Missing ENTRIES section');
    }

    if (!toon.includes('# PULSE Data Export')) {
        errors.push('Invalid TOON header');
    }

    return {
        valid: errors.length === 0,
        errors
    };
};
