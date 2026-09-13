const inputText = document.getElementById('inputText');
const styledOutput = document.getElementById('styledOutput');
const outputMode = document.getElementById('outputMode');
const fontSelect = document.getElementById('fontSelect');

const chkBold = document.getElementById('chkBold');
const chkItalic = document.getElementById('chkItalic');
const chkUnderline = document.getElementById('chkUnderline');
const chkStrike = document.getElementById('chkStrike');
const chkMono = document.getElementById('chkMono');
const chkUpper = document.getElementById('chkUpper');
const chkLower = document.getElementById('chkLower');
const chkCapital = document.getElementById('chkCapital');
const chkReverse = document.getElementById('chkReverse');

const inCharCount = document.getElementById('inCharCount');
const inWordCount = document.getElementById('inWordCount');
const inLineCount = document.getElementById('inLineCount');
const outCharCount = document.getElementById('outCharCount');
const outWordCount = document.getElementById('outWordCount');

const btnCopy = document.getElementById('btnCopy');
const copyText = document.getElementById('copyText');
const btnClearInput = document.getElementById('btnClearInput');
const btnReset = document.getElementById('btnReset');
const btnPaste = document.getElementById('btnPaste');
const toast = document.getElementById('toast');
const toastText = document.getElementById('toastText');

const fontPills = document.querySelectorAll('#fontPills .font-pill');
const modePills = document.querySelectorAll('#modePills .mode-pill');

const checkboxes = [
    chkBold, chkItalic, chkUnderline, chkStrike, chkMono,
    chkUpper, chkLower, chkCapital, chkReverse
];

function syncCheckboxPills() {
    checkboxes.forEach(cb => {
        const parentLabel = cb.closest('.toggle-pill');
        if (parentLabel) {
            if (cb.checked) {
                parentLabel.classList.add('active');
            } else {
                parentLabel.classList.remove('active');
            }
        }
    });
}

chkUpper.addEventListener('change', () => {
    if (chkUpper.checked) {
        chkLower.checked = false;
        chkCapital.checked = false;
    }
    syncCheckboxPills();
    updateOutput();
});

chkLower.addEventListener('change', () => {
    if (chkLower.checked) {
        chkUpper.checked = false;
        chkCapital.checked = false;
    }
    syncCheckboxPills();
    updateOutput();
});

chkCapital.addEventListener('change', () => {
    if (chkCapital.checked) {
        chkUpper.checked = false;
        chkLower.checked = false;
    }
    syncCheckboxPills();
    updateOutput();
});

checkboxes.forEach(cb => {
    if (cb !== chkUpper && cb !== chkLower && cb !== chkCapital) {
        cb.addEventListener('change', () => {
            syncCheckboxPills();
            updateOutput();
        });
    }
});

fontPills.forEach(pill => {
    pill.addEventListener('click', () => {
        fontPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        fontSelect.value = pill.dataset.font;
        updateOutput();
    });
});

modePills.forEach(pill => {
    pill.addEventListener('click', () => {
        modePills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        outputMode.value = pill.dataset.mode;
        updateOutput();
    });
});

inputText.addEventListener('input', updateOutput);
outputMode.addEventListener('change', () => {
    modePills.forEach(p => {
        p.classList.toggle('active', p.dataset.mode === outputMode.value);
    });
    updateOutput();
});
fontSelect.addEventListener('change', () => {
    fontPills.forEach(p => {
        p.classList.toggle('active', p.dataset.font === fontSelect.value);
    });
    updateOutput();
});

if (btnPaste) {
    btnPaste.addEventListener('click', async () => {
        try {
            const text = await navigator.clipboard.readText();
            if (text) {
                inputText.value = text;
                updateOutput();
                showToast('Teks berhasil ditempel dari clipboard');
            }
        } catch (err) {
            inputText.focus();
        }
    });
}

btnClearInput.addEventListener('click', () => {
    inputText.value = '';
    updateOutput();
    inputText.focus();
});

btnReset.addEventListener('click', () => {
    inputText.value = '';
    checkboxes.forEach(cb => cb.checked = false);
    syncCheckboxPills();
    fontSelect.value = 'default';
    fontPills.forEach(p => {
        p.classList.toggle('active', p.dataset.font === 'default');
    });
    outputMode.value = 'unicode';
    modePills.forEach(p => {
        p.classList.toggle('active', p.dataset.mode === 'unicode');
    });
    updateOutput();
    showToast('Semua pengaturan dan teks telah direset');
});

btnCopy.addEventListener('click', async () => {
    const textToCopy = styledOutput.innerText || styledOutput.textContent;
    if (!textToCopy) {
        showToast('Tidak ada teks untuk disalin!');
        return;
    }

    try {
        await navigator.clipboard.writeText(textToCopy);
        copyText.textContent = 'Tersalin!';
        showToast('Teks berhasil disalin ke clipboard!');
        setTimeout(() => {
            copyText.textContent = 'Salin Hasil';
        }, 2000);
    } catch (err) {
        const textarea = document.createElement('textarea');
        textarea.value = textToCopy;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showToast('Teks berhasil disalin!');
    }
});

window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        btnCopy.click();
    }
});

function updateOutput() {
    const rawText = inputText.value;
    updateInputStats(rawText);

    if (!rawText) {
        styledOutput.textContent = '';
        styledOutput.removeAttribute('style');
        updateOutputStats('');
        return;
    }

    let processedText = rawText;

    if (chkUpper.checked) {
        processedText = processedText.toUpperCase();
    } else if (chkLower.checked) {
        processedText = processedText.toLowerCase();
    } else if (chkCapital.checked) {
        processedText = toTitleCase(processedText);
    }

    if (chkReverse.checked) {
        processedText = processedText.split('').reverse().join('');
    }

    applyVisualStyles();

    const mode = outputMode.value;
    let finalFormattedText = processedText;

    if (mode === 'unicode') {
        finalFormattedText = convertToUnicode(processedText);
    } else if (mode === 'markdown') {
        finalFormattedText = convertToMarkdown(processedText);
    } else if (mode === 'html') {
        finalFormattedText = convertToHTML(processedText);
    }

    styledOutput.textContent = finalFormattedText;
    updateOutputStats(finalFormattedText);
}

function applyVisualStyles() {
    styledOutput.style.fontWeight = chkBold.checked ? '700' : 'normal';
    styledOutput.style.fontStyle = chkItalic.checked ? 'italic' : 'normal';

    let textDecorations = [];
    if (chkUnderline.checked) textDecorations.push('underline');
    if (chkStrike.checked) textDecorations.push('line-through');
    styledOutput.style.textDecoration = textDecorations.length > 0 ? textDecorations.join(' ') : 'none';

    if (chkMono.checked) {
        styledOutput.style.fontFamily = "'JetBrains Mono', monospace";
    } else {
        const fontVal = fontSelect.value;
        if (fontVal === 'arial') {
            styledOutput.style.fontFamily = 'Arial, sans-serif';
        } else if (fontVal === 'poppins') {
            styledOutput.style.fontFamily = "'Poppins', sans-serif";
        } else if (fontVal === 'times new roman') {
            styledOutput.style.fontFamily = "'Times New Roman', Times, serif";
        } else if (fontVal === 'montserrat') {
            styledOutput.style.fontFamily = "'Montserrat', sans-serif";
        } else {
            styledOutput.style.fontFamily = "'Plus Jakarta Sans', sans-serif";
        }
    }
}

function toTitleCase(str) {
    return str.replace(/\b\w+/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
}

function convertToUnicode(str) {
    let result = str;

    const isBold = chkBold.checked;
    const isItalic = chkItalic.checked;
    const isMono = chkMono.checked;
    const isSerif = fontSelect.value === 'times new roman';

    if (isMono) {
        result = mapToUnicode(result, unicodeMapMono);
    } else if (isBold && isItalic) {
        result = mapToUnicode(result, isSerif ? unicodeMapSerifBoldItalic : unicodeMapBoldItalic);
    } else if (isBold) {
        result = mapToUnicode(result, isSerif ? unicodeMapSerifBold : unicodeMapBold);
    } else if (isItalic) {
        result = mapToUnicode(result, isSerif ? unicodeMapSerifItalic : unicodeMapItalic);
    }

    if (chkStrike.checked) {
        result = result.split('').map(char => char === '\n' ? '\n' : char + '\u0336').join('');
    }

    if (chkUnderline.checked) {
        result = result.split('').map(char => char === '\n' ? '\n' : char + '\u0332').join('');
    }

    return result;
}

function convertToMarkdown(str) {
    let lines = str.split('\n');
    let formattedLines = lines.map(line => {
        if (!line.trim()) return line;
        let l = line;
        if (chkBold.checked) l = `*${l}*`;
        if (chkItalic.checked) l = `_${l}_`;
        if (chkStrike.checked) l = `~${l}~`;
        if (chkMono.checked) l = `\`\`\`${l}\`\`\``;
        return l;
    });
    return formattedLines.join('\n');
}

function convertToHTML(str) {
    let lines = str.split('\n');
    let formattedLines = lines.map(line => {
        if (!line.trim()) return line;
        let l = line;
        if (chkBold.checked) l = `<b>${l}</b>`;
        if (chkItalic.checked) l = `<i>${l}</i>`;
        if (chkUnderline.checked) l = `<u>${l}</u>`;
        if (chkStrike.checked) l = `<s>${l}</s>`;
        if (chkMono.checked) l = `<code>${l}</code>`;
        return l;
    });
    return formattedLines.join('\n');
}

function mapToUnicode(text, map) {
    return text.split('').map(char => map[char] || char).join('');
}

const unicodeMapBold = {
    'A': '𝗔', 'B': '𝗕', 'C': '𝗖', 'D': '𝗗', 'E': '𝗘', 'F': '𝗙', 'G': '𝗚', 'H': '𝗛', 'I': '𝗜', 'J': '𝗝',
    'K': '𝗞', 'L': '𝗟', 'M': '𝗠', 'N': '𝗡', 'O': '𝗢', 'P': '𝗣', 'Q': '𝗤', 'R': '𝗥', 'S': '𝗦', 'T': '𝗧',
    'U': '𝗨', 'V': '𝗩', 'W': '𝗪', 'X': '𝗫', 'Y': '𝗬', 'Z': '𝗭',
    'a': '𝗮', 'b': '𝗯', 'c': '𝗰', 'd': '𝗱', 'e': '𝗲', 'f': '𝗳', 'g': '𝗴', 'h': '𝗵', 'i': '𝗶', 'j': '𝗷',
    'k': '𝗸', 'l': '𝗹', 'm': '𝗺', 'n': '𝗻', 'o': '𝗼', 'p': '𝗽', 'q': '𝗾', 'r': '𝗿', 's': '𝘀', 't': '𝘁',
    'u': '𝘂', 'v': '𝘃', 'w': '𝘄', 'x': '𝘅', 'y': '𝘆', 'z': '𝘇',
    '0': '𝟬', '1': '𝟭', '2': '𝟮', '3': '𝟯', '4': '𝟰', '5': '𝟱', '6': '𝟲', '7': '𝟳', '8': '𝟴', '9': '𝟵'
};

const unicodeMapSerifBold = {
    'A': '𝐀', 'B': '𝐁', 'C': '𝐂', 'D': '𝐃', 'E': '𝐄', 'F': '𝐅', 'G': '𝐆', 'H': '𝐇', 'I': '𝐈', 'J': '𝐉',
    'K': '𝐊', 'L': '𝐋', 'M': '𝐌', 'N': '𝐍', 'O': '𝐎', 'P': '𝐏', 'Q': '𝐐', 'R': '𝐑', 'S': '𝐒', 'T': '𝐓',
    'U': '𝐔', 'V': '𝐕', 'W': '𝐖', 'X': '𝐗', 'Y': '𝐘', 'Z': '𝐙',
    'a': '𝐚', 'b': '𝐛', 'c': '𝐜', 'd': '𝐝', 'e': '𝐞', 'f': '𝐟', 'g': '𝐠', 'h': '𝐡', 'i': '𝐢', 'j': '𝐣',
    'k': '𝐤', 'l': '𝐥', 'm': '𝐦', 'n': '𝐧', 'o': '𝐨', 'p': '𝐩', 'q': '𝐪', 'r': '𝐫', 's': '𝐬', 't': '𝐭',
    'u': '𝐮', 'v': '𝐯', 'w': '𝐰', 'x': '𝐱', 'y': '𝐲', 'z': '𝐳',
    '0': '𝟎', '1': '𝟏', '2': '𝟐', '3': '𝟑', '4': '𝟒', '5': '𝟓', '6': '𝟔', '7': '𝟕', '8': '𝟖', '9': '𝟗'
};

const unicodeMapSerifItalic = {
    'A': '𝐴', 'B': '𝐵', 'C': '𝐶', 'D': '𝐷', 'E': '𝐸', 'F': '𝐹', 'G': '𝐺', 'H': '𝐻', 'I': '𝐼', 'J': '𝐽',
    'K': '𝐾', 'L': '𝐿', 'M': '𝑀', 'N': '𝑁', 'O': '𝑂', 'P': '𝑃', 'Q': '𝑄', 'R': '𝑅', 'S': '𝑆', 'T': '𝑇',
    'U': '𝑈', 'V': '𝑉', 'W': '𝑊', 'X': '𝑋', 'Y': '𝑌', 'Z': '𝑍',
    'a': '𝑎', 'b': '𝑏', 'c': '𝑐', 'd': '𝑑', 'e': '𝑒', 'f': '𝑓', 'g': '𝑔', 'h': 'ℎ', 'i': '𝑖', 'j': '𝗃',
    'k': '𝑘', 'l': '𝑙', 'm': '𝑚', 'n': '𝑛', 'o': '𝑜', 'p': '𝑝', 'q': '𝑞', 'r': '𝑟', 's': '𝑠', 't': '𝑡',
    'u': '𝑢', 'v': '𝑣', 'w': '𝑤', 'x': '𝑥', 'y': '𝑦', 'z': '𝑧'
};

const unicodeMapSerifBoldItalic = {
    'A': '𝑨', 'B': '𝑩', 'C': '𝑪', 'D': '𝑫', 'E': '𝑬', 'F': '𝑭', 'G': '𝑮', 'H': '𝑯', 'I': '𝑰', 'J': '𝑱',
    'K': '𝑲', 'L': '𝑳', 'M': '𝑴', 'N': '𝑵', 'O': '𝑶', 'P': '𝑷', 'Q': '𝑸', 'R': '𝑹', 'S': '𝑺', 'T': '𝑻',
    'U': '𝑼', 'V': '𝑽', 'W': '𝑾', 'X': '𝑿', 'Y': '𝒀', 'Z': '𝒁',
    'a': '𝒂', 'b': '𝒃', 'c': '𝒄', 'd': '𝒅', 'e': '𝒆', 'f': '𝒇', 'g': '𝒈', 'h': '𝒉', 'i': '𝒊', 'j': '𝒋',
    'k': '𝒌', 'l': '𝒍', 'm': '𝒎', 'n': '𝒏', 'o': '𝒐', 'p': '𝒑', 'q': '𝒒', 'r': '𝒓', 's': '𝒔', 't': '𝒕',
    'u': '𝒖', 'v': '𝒗', 'w': '𝒘', 'x': '𝒙', 'y': '𝒚', 'z': '𝒛'
};

const unicodeMapItalic = {
    'A': '𝘈', 'B': '𝘉', 'C': '𝘊', 'D': '𝘋', 'E': '𝘌', 'F': '𝘍', 'G': '𝘎', 'H': '𝘏', 'I': '𝘐', 'J': '𝘑',
    'K': '𝘒', 'L': '𝘓', 'M': '𝘔', 'N': '𝘕', 'O': '𝘖', 'P': '𝘗', 'Q': '𝘘', 'R': '𝘙', 'S': '𝘚', 'T': '𝘛',
    'U': '𝘜', 'V': '𝘝', 'W': '𝘞', 'X': '𝘟', 'Y': '𝘠', 'Z': '𝘡',
    'a': '𝘢', 'b': '𝘣', 'c': '𝘤', 'd': '𝘥', 'e': '𝘦', 'f': '𝘧', 'g': '𝘨', 'h': '𝘩', 'i': '𝘪', 'j': '𝘫',
    'k': '𝘬', 'l': '𝘭', 'm': '𝘮', 'n': '𝘯', 'o': '𝘰', 'p': '𝘱', 'q': '𝘲', 'r': '𝘳', 's': '𝘴', 't': '𝘵',
    'u': '𝘶', 'v': '𝘷', 'w': '𝘸', 'x': '𝘹', 'y': '𝘺', 'z': '𝘻'
};

const unicodeMapBoldItalic = {
    'A': '𝘼', 'B': '𝘽', 'C': '𝘾', 'D': '𝘿', 'E': '𝙀', 'F': '𝙁', 'G': '𝙂', 'H': '𝙃', 'I': '𝙄', 'J': '𝙅',
    'K': '𝙆', 'L': '𝙇', 'M': '𝙈', 'N': '𝙉', 'O': '𝙊', 'P': '𝙋', 'Q': '𝙌', 'R': '𝙍', 'S': '𝙎', 'T': '𝙏',
    'U': '𝙐', 'V': '𝙑', 'W': '𝙒', 'X': '𝙓', 'Y': '𝙔', 'Z': '𝙕',
    'a': '𝙖', 'b': '𝙗', 'c': '𝙘', 'd': '𝒅', 'e': '𝙚', 'f': '𝙛', 'g': '𝙜', 'h': '𝙝', 'i': '𝙞', 'j': '𝙟',
    'k': '𝙠', 'l': '𝙡', 'm': '𝙢', 'n': '𝙣', 'o': '𝙤', 'p': '𝙥', 'q': '𝙦', 'r': '𝙧', 's': '𝙨', 't': '𝙩',
    'u': '𝙪', 'v': '𝙫', 'w': '𝙬', 'x': '𝙭', 'y': '𝙮', 'z': '𝙯'
};

const unicodeMapMono = {
    'A': '𝙰', 'B': '𝙱', 'C': '𝙲', 'D': '𝙳', 'E': '𝙴', 'F': '𝙵', 'G': '𝙶', 'H': '𝙷', 'I': '𝙸', 'J': '𝙹',
    'K': '𝙺', 'L': '𝙻', 'M': '𝙼', 'N': '𝙽', 'O': '𝙾', 'P': '𝙿', 'Q': '𝚀', 'R': '𝚁', 'S': '𝚂', 'T': '𝚃',
    'U': '𝚄', 'V': '𝚅', 'W': '𝚆', 'X': '𝚇', 'Y': '𝚈', 'Z': '𝚉',
    'a': '𝚊', 'b': '𝚋', 'c': '𝚌', 'd': '𝚍', 'e': '𝚎', 'f': '𝚏', 'g': '𝚐', 'h': '𝚑', 'i': '𝚒', 'j': '𝚓',
    'k': '𝚔', 'l': '𝚕', 'm': '𝚖', 'n': '𝚗', 'o': '𝚘', 'p': '𝚙', 'q': '𝚚', 'r': '𝚛', 's': '𝚜', 't': '𝚝',
    'u': '𝚞', 'v': '𝚟', 'w': '𝚠', 'x': '𝚡', 'y': '𝚢', 'z': '𝚣',
    '0': '𝟶', '1': '𝟷', '2': '𝟸', '3': '𝟹', '4': '𝟺', '5': '𝟻', '6': '𝟼', '7': '𝟽', '8': '𝟾', '9': '𝟿'
};

function updateInputStats(text) {
    inCharCount.textContent = text.length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    inWordCount.textContent = words;
    const lines = text ? text.split('\n').length : 0;
    inLineCount.textContent = lines;
}

function updateOutputStats(text) {
    outCharCount.textContent = text.length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    outWordCount.textContent = words;
}

function showToast(msg) {
    if (toastText) {
        toastText.textContent = msg;
    } else {
        toast.textContent = msg;
    }
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 2200);
}

syncCheckboxPills();
updateOutput();
