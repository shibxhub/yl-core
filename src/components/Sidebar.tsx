import { useDrag } from 'react-dnd';

const DraggableComponent = ({ type }: { type: any }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'component',
    item: { type },
    collect: (monitor) => ({ isDragging: !!monitor.isDragging() }),
  }));

  const labels: Record<string, string> = {
    text: '文本',
    button: '按钮',
    input: '输入框',
    chart: '图表',
    table: '表格',
    'wyn-report': 'Wyn 报表'
  };

  return (
    <div
      ref={drag}
      style={{
        padding: '10px',
        margin: '5px',
        border: '1px solid #ccc',
        borderRadius: '4px',
        backgroundColor: '#f9f9f9',
        cursor: 'move',
        opacity: isDragging ? 0.5 : 1,
      }}
    >
      {labels[type] || type}
    </div>
  );
};

const Sidebar = () => {
  return (
    <div style={{
      width: 200,
      padding: 10,
      borderRight: '1px solid #ddd',
      backgroundColor: '#f5f5f5',
    }}>
      <h3>🔧 组件库</h3>
      {(['text', 'button', 'input', 'chart', 'table', 'wyn-report'] as const).map(type => (
        <DraggableComponent key={type} type={type} />
      ))}
    </div>
  );
};

export default Sidebar;