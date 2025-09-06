import { useRef } from 'react';
import { useStore } from '../store';
import { PageComponent } from '../types'; // ✅ 添加这行

interface PropertyPanelProps {
  fileInputRef: React.RefObject<HTMLInputElement>;
}

const PropertyPanel = ({ fileInputRef }: PropertyPanelProps) => {
  const {
    components,
    selectedIds,
    meta,
    undo,
    redo,
    canUndo,
    canRedo,
    deleteComponent,
    updateMeta,
    setComponents,
  } = useStore();

  const selectedComponent = selectedIds.length === 1
    ? components.find(c => c.id === selectedIds[0])
    : null;

  const updateComponent = (id: string, props: Partial<PageComponent>) => {
    useStore.getState().updateComponent(id, props);
  };

  const exportJSON = () => {
    const data = { version: 1, components, selectedIds, meta };
    console.log('【页面结构】', data);
    alert('已输出到控制台');
  };

  const saveJSON = () => {
    const data = { version: 1, components, selectedIds, meta, createdAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${meta.title.replace(/\W/g, '_') || 'page'}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const loadFromJSON = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === 'string') {
        try {
          const json = JSON.parse(result);
          if (Array.isArray(json.components)) {
            setComponents(json.components);
            if (json.meta) updateMeta(json.meta);
            alert(`✅ 成功加载 ${json.components.length} 个组件`);
          } else if (json.version && Array.isArray(json)) {
            setComponents(json);
            alert(`✅ 成功加载 ${json.length} 个组件`);
          } else {
            throw new Error('无效格式');
          }
        } catch (err) {
          alert('❌ 无法解析 JSON 文件');
        }
      } else {
        alert('❌ 文件内容不是文本');
      }
    };
    reader.readAsText(file);
    if (e.target) e.target.value = '';
  };

  const exportAsHTML = () => {
    const { components, meta } = useStore.getState();

    const renderComponent = (comp: PageComponent) => {
      const { x, y } = comp.position;
      const style = `position:absolute;left:${x}px;top:${y}px;`;

      switch (comp.type) {
        case 'text':
          return `<div style="${style};color:${comp.props.color};font-size:${comp.props.fontSize}px;">${comp.props.text}</div>`;
        case 'button':
          return `<button style="${style}">${comp.props.text}</button>`;
        case 'input':
          return `<input type="text" placeholder="${comp.props.text}" style="${style}" />`;
        case 'chart':
          return `<div style="${style};width:300px;height:200px;border:2px dashed #1890ff;display:flex;align-items:center;justify-content:center;">📊 图表</div>`;
        case 'table':
          return `<div style="${style};width:400px;height:150px;border:1px solid #ddd;font-size:12px;">表格</div>`;
        case 'wyn-report':
          const width = comp.size?.width ?? 600;
          const height = comp.size?.height ?? 400;
          return `<iframe src="${comp.props.reportUrl}" style="${style};width:${width}px;height:${height}px;border:1px solid #ddd;"></iframe>`;
        default:
          return `<div style="${style}">未知组件</div>`;
      }
    };

    const componentsHTML = components.map(renderComponent).join('\n');

    const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <title>${meta.title}</title>
  <meta name="description" content="${meta.description}" />
  <style>
    body { margin: 0; font-family: Arial, sans-serif; background: #fafafa; }
    input, button { padding: 6px; border: 1px solid #ccc; border-radius: 4px; }
  </style>
</head>
<body>
  ${componentsHTML}
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${meta.title.replace(/\W/g, '_') || 'page'}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const publishToServer = () => {
    const data = { version: 1, components, selectedIds, meta, publishedAt: new Date().toISOString() };
    console.log('【发布数据】', data);
    alert('✅ 已模拟发布');
  };

const handleChange = (
  key: string,
  value: any,
  id: string = selectedComponent?.id!
) => {
  if (!id) return;

  const currentSize = selectedComponent?.size;

  if (key === 'x' || key === 'y') {
    updateComponent(id, {
      position: { ...selectedComponent!.position, [key]: Number(value) },
    });
  } else if (key === 'width' || key === 'height') {
    updateComponent(id, {
      size: {
        width: key === 'width' ? Number(value) : (currentSize?.width ?? 600),
        height: key === 'height' ? Number(value) : (currentSize?.height ?? 400),
      },
    });
  } else {
    updateComponent(id, {
      props: { ...selectedComponent!.props, [key]: value },
    });
  }
};

  return (
    <div style={{
      width: 280,
      padding: '16px',
      borderLeft: '1px solid #ddd',
      backgroundColor: '#f8f9fa',
      overflowY: 'auto',
      height: '100vh'
    }}>
      <h3>📌 页面设置</h3>
      <div style={style.group}>
        <label>标题</label>
        <input
          type="text"
          value={meta.title}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateMeta({ title: e.target.value })}
          style={style.input}
        />
      </div>
      <div style={style.group}>
        <label>描述</label>
        <textarea
          value={meta.description}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateMeta({ description: e.target.value })}
          style={{ ...style.input, height: '60px' }}
        />
      </div>

      <h3 style={{ marginTop: 20 }}>⚙️ 属性设置</h3>
      {selectedComponent ? (
        <>
          <div style={style.group}>
            <label>X</label>
            <input
              type="number"
              value={selectedComponent.position.x}
              onChange={(e) => handleChange('x', e.target.value)}
              style={style.input}
            />
          </div>
          <div style={style.group}>
            <label>Y</label>
            <input
              type="number"
              value={selectedComponent.position.y}
              onChange={(e) => handleChange('y', e.target.value)}
              style={style.input}
            />
          </div>

          {selectedComponent.type === 'text' && (
            <>
              <div style={style.group}>
                <label>文本</label>
                <input
                  type="text"
                  value={selectedComponent.props.text || ''}
                  onChange={(e) => handleChange('text', e.target.value)}
                  style={style.input}
                />
              </div>
              <div style={style.group}>
                <label>字号</label>
                <input
                  type="number"
                  value={selectedComponent.props.fontSize || 16}
                  onChange={(e) => handleChange('fontSize', Number(e.target.value))}
                  style={style.input}
                />
              </div>
              <div style={style.group}>
                <label>颜色</label>
                <input
                  type="color"
                  value={selectedComponent.props.color || '#000'}
                  onChange={(e) => handleChange('color', e.target.value)}
                  style={{ ...style.input, height: '40px' }}
                />
              </div>
            </>
          )}

          {(selectedComponent.type === 'button' || selectedComponent.type === 'input') && (
            <div style={style.group}>
              <label>{selectedComponent.type === 'button' ? '按钮文本' : '占位符'}</label>
              <input
                type="text"
                value={selectedComponent.props.text || ''}
                onChange={(e) => handleChange('text', e.target.value)}
                style={style.input}
              />
            </div>
          )}

          {selectedComponent.type === 'wyn-report' && (
            <>
              <div style={style.group}>
                <label>报表 URL</label>
                <input
                  type="text"
                  value={selectedComponent.props.reportUrl || ''}
                  onChange={(e) => handleChange('reportUrl', e.target.value)}
                  style={style.input}
                />
              </div>
              <div style={style.group}>
                <label>宽度</label>
                <input
                  type="number"
                  value={selectedComponent.size?.width || 600}
                  onChange={(e) => handleChange('width', e.target.value)}
                  style={style.input}
                />
              </div>
              <div style={style.group}>
                <label>高度</label>
                <input
                  type="number"
                  value={selectedComponent.size?.height || 400}
                  onChange={(e) => handleChange('height', e.target.value)}
                  style={style.input}
                />
              </div>
            </>
          )}
        </>
      ) : (
        <p style={{ color: '#666' }}>👈 选中组件进行编辑</p>
      )}

      <div style={{ marginTop: 20, borderTop: '1px solid #ddd', paddingTop: 10 }}>
        <button onClick={exportJSON} style={style.btn}>📤 导出 JSON</button>
        <button onClick={saveJSON} style={style.btn}>💾 保存为 JSON</button>
        <button onClick={loadFromJSON} style={style.btn}>📂 加载 JSON</button>
        <button onClick={exportAsHTML} style={style.btn}>🌐 导出为 HTML</button>
        <button onClick={publishToServer} style={style.btn}>🚀 发布到服务器</button>
        <button onClick={undo} disabled={!canUndo()} style={style.btn}>🔙 撤销 (Ctrl+Z)</button>
        <button onClick={redo} disabled={!canRedo()} style={style.btn}>🔁 重做 (Ctrl+Y)</button>
        {selectedIds.length > 0 && (
          <button
            onClick={() => {
              if (confirm(`删除 ${selectedIds.length} 个组件？`)) {
                selectedIds.forEach(id => deleteComponent(id));
              }
            }}
            style={{ ...style.btn, backgroundColor: '#ff4d4f' }}
          >
            🗑 删除组件 ({selectedIds.length})
          </button>
        )}
      </div>

      <input
        type="file"
        accept=".json"
        ref={fileInputRef}
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />
    </div>
  );
};

const style = {
  group: { marginBottom: '16px' },
  label: { display: 'block', marginBottom: '6px', fontSize: '13px', color: '#555' },
  input: { width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px' },
  btn: {
    display: 'block',
    width: '100%',
    padding: '10px',
    margin: '6px 0',
    border: '1px solid #1890ff',
    backgroundColor: '#1890ff',
    color: 'white',
    borderRadius: '4px',
    cursor: 'pointer',
  }
};

export default PropertyPanel;