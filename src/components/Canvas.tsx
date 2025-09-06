import { useDrop, useDrag } from 'react-dnd';
import { useRef, useEffect } from 'react';
import { useStore } from '../store';
import { PageComponent } from '../types';

const RenderComponent = ({ comp }: { comp: PageComponent }) => {
  const {
    selectComponent,
    updateComponent,
    selectedIds,
    components,
  } = useStore();

  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: 'component-on-canvas',
      item: () => {
        if (!selectedIds.includes(comp.id)) {
          selectComponent(comp.id, true);
        }
        return { id: comp.id, isMulti: selectedIds.length > 1 };
      },
      collect: (monitor) => ({ isDragging: !!monitor.isDragging() }),
    }),
    [comp.id, selectedIds]
  );

  const [, drop] = useDrop({ accept: 'component-on-canvas' }, []);

  const ref = useRef<HTMLDivElement | HTMLButtonElement | HTMLInputElement>(null);

  useEffect(() => {
    if (ref.current) {
      drag(drop(ref));
    }
  }, [drag, drop]);

  const style = {
    position: 'absolute' as const,
    left: comp.position.x,
    top: comp.position.y,
    cursor: 'move',
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 1,
  };

  const isSelected = selectedIds.includes(comp.id);

  const commonProps = {
    onClick: (e: React.MouseEvent) => {
      e.stopPropagation();
      selectComponent(comp.id, e.shiftKey || e.ctrlKey || e.metaKey);
    },
    style: {
      ...style,
      outline: isSelected ? '2px solid #1890ff' : 'none',
    },
  };

  switch (comp.type) {
    case 'text':
      return (
        <div
          ref={ref as any}
          {...commonProps}
          style={{
            ...commonProps.style,
            color: comp.props.color || '#000',
            fontSize: `${comp.props.fontSize || 16}px`,
          }}
        >
          {comp.props.text || '文本'}
        </div>
      );
    case 'button':
      return (
        <button
          ref={ref as any}
          {...commonProps}
        >
          {comp.props.text || '按钮'}
        </button>
      );
    case 'input':
      return (
        <input
          ref={ref as any}
          {...commonProps}
          type="text"
          placeholder={comp.props.text || '请输入'}
          style={{
            ...commonProps.style,
            padding: '6px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            width: '150px',
          }}
        />
      );
    case 'chart':
      return (
        <div
          ref={ref as any}
          {...commonProps}
          style={{
            ...commonProps.style,
            width: 300,
            height: 200,
            border: '2px dashed #1890ff',
            backgroundColor: '#e6f7ff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
            color: '#1890ff',
          }}
        >
          📊 图表占位符
        </div>
      );
    case 'table':
      return (
        <div
          ref={ref as any}
          {...commonProps}
          style={{
            ...commonProps.style,
            width: 400,
            height: 150,
            border: '1px solid #ddd',
            fontSize: '12px',
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f5f5f5' }}>
                <th style={{ border: '1px solid #ddd', padding: '4px' }}>列1</th>
                <th style={{ border: '1px solid #ddd', padding: '4px' }}>列2</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ border: '1px solid #ddd', padding: '4px' }}>数据1</td>
                <td style={{ border: '1px solid #ddd', padding: '4px' }}>数据2</td>
              </tr>
            </tbody>
          </table>
        </div>
      );
    case 'wyn-report':
      return (
        <div
          ref={ref as any}
          {...commonProps}
          style={{
            ...commonProps.style,
            width: comp.size?.width || 600,
            height: comp.size?.height || 400,
            border: '1px solid #ddd',
          }}
        >
          <iframe
            src={comp.props.reportUrl || 'https://demo.grapecity.com.cn/wyn/Reports/View/787d8d9a-3e66-4b64-a2ca-a12800b77fbf'}
            width="100%"
            height="100%"
            frameBorder="0"
          />
        </div>
      );
    default:
      return (
        <div
          ref={ref as any}
          {...commonProps}
          style={commonProps.style}
        >
          未知组件
        </div>
      );
  }
};

const Canvas = () => {
  const { addComponent, components, updateComponent, selectedIds } = useStore();
  const canvasRef = useRef<HTMLDivElement>(null);

  const snap = (n: number) => Math.round(n / 10) * 10;

  const [, drop] = useDrop(
    () => ({
      accept: ['component', 'component-on-canvas'],
      drop: (item: { type?: any; id?: string; isMulti?: boolean }, monitor) => {
        const offset = monitor.getClientOffset();
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!offset || !rect) return;

        const x = snap(offset.x - rect.left);
        const y = snap(offset.y - rect.top);

        if (typeof item.id !== 'undefined') {
          const delta = {
            x: x - (components.find(c => c.id === item.id)?.position.x || 0),
            y: y - (components.find(c => c.id === item.id)?.position.y || 0)
          };

          updateComponent(item.id, { position: { x, y } });

          if (item.isMulti) {
            selectedIds.forEach(id => {
              if (id !== item.id) {
                const c = components.find(c => c.id === id);
                if (c) {
                  updateComponent(id, {
                    position: { x: c.position.x + delta.x, y: c.position.y + delta.y }
                  });
                }
              }
            });
          }
        } else if (item.type) {
          let size = undefined;
          if (item.type === 'wyn-report') {
            size = { width: 600, height: 400 };
          }

          addComponent({
            type: item.type,
            props: getDefaultProps(item.type),
            position: { x, y },
            size,
          });
        }
      },
    }),
    [addComponent, updateComponent, components, selectedIds]
  );

  useEffect(() => {
    if (canvasRef.current) {
      drop(canvasRef.current);
    }
  }, [drop]);

  const getDefaultProps = (type: any) => {
    switch (type) {
      case 'text': return { text: '新文本', fontSize: 16, color: '#000' };
      case 'button': return { text: '新按钮' };
      case 'input': return { text: '请输入内容' };
      case 'wyn-report': return { reportUrl: 'https://demo.grapecity.com.cn/wyn/Reports/View/...' };
      default: return {};
    }
  };

  return (
    <div
      ref={canvasRef}
      style={{
        flex: 1,
        position: 'relative',
        minHeight: '100vh',
        backgroundColor: '#fafafa',
        overflow: 'auto',
        cursor: 'crosshair',
      }}
    >
      {components.map((comp) => (
        <RenderComponent key={comp.id} comp={comp} />
      ))}
    </div>
  );
};

export default Canvas;