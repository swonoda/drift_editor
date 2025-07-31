function parseAozora(text) {
    // 傍点：対象の単語を収集
    const emphMatches = [...text.matchAll(/［＃「(.+?)」に傍点］/g)];
    const emphWords = emphMatches.map(match => match[1]);

    // 傍点指示を削除
    text = text.replace(/［＃「(.+?)」に傍点］/g, '');

    // 各単語に対して最後の出現を強調
    for (const word of emphWords) {
        const index = text.lastIndexOf(word);
        if (index === -1) continue;
        text = text.slice(0, index) + `<span class="emph">${word}</span>` + text.slice(index + word.length);
    }

    // ルビ変換
    text = text.replace(/｜(.*?)《(.*?)》/g, '<ruby>$1<rt>$2</rt></ruby>');
    console.log(text);
    return text;
}