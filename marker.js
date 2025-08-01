
window.addEventListener('DOMContentLoaded', () => {
  const viewer = document.getElementById('viewer');

  // マウスでテキストを選択して離したときに発火
  viewer.addEventListener('mouseup', () => {
    console.log("marker")
    const selection = window.getSelection();

    // 選択されていて、範囲が取得できるときのみ処理
    if (!selection.isCollapsed && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);

      // span要素を作ってclassを付ける
      const highlight = document.createElement('span');
      highlight.className = 'highlight';

      // 選択範囲をhighlightで囲む
      try {
        range.surroundContents(highlight);
        selection.removeAllRanges();
      } catch (e) {
        console.warn('マーカー範囲にタグが含まれている場合は囲めません:', e);
      }
    }
  });
});