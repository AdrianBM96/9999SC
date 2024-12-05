import React from 'react';
import styled from 'styled-components';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  NodeProps,
  EdgeProps,
  useOnSelectionChange,
  Node,
} from 'react-flow-renderer';

interface NodeData {
  label: string;
  description?: string;
}

interface WorkflowNode extends Node {
  data: NodeData;
}

const Container = styled.div`
  height: 600px;
  border: 1px solid #ccc;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
`;

const FlowContainer = styled.div`
  flex: 1;
  display: flex;
  min-height: 0;
`;

const StyledNode = styled.div<{ $isStart?: boolean; $isEnd?: boolean }>`
  padding: 15px;
  border-radius: 8px;
  background: ${props => 
    props.$isStart ? '#4ade80' : 
    props.$isEnd ? '#f87171' : 
    '#fff'
  };
  color: ${props => (props.$isStart || props.$isEnd) ? '#fff' : '#374151'};
  border: 2px solid ${props => 
    props.$isStart ? '#22c55e' : 
    props.$isEnd ? '#ef4444' : 
    '#e5e7eb'
  };
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  min-width: 180px;
  transition: all 0.2s ease;

  &:hover {
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    transform: translateY(-1px);
  }
`;

const NodeHeader = styled.div`
  font-weight: 600;
  margin-bottom: 4px;
`;

const NodeDescription = styled.div`
  font-size: 0.875rem;
  color: ${props => props.color || '#6b7280'};
  margin-top: 4px;
`;

const NodeType = styled.div`
  font-size: 0.75rem;
  color: ${props => props.color || '#9ca3af'};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const Edge = styled.div`
  background: #9ca3af;
  border-radius: 2px;
  height: 2px;
  animation: ${props => props.animated ? 'flowAnimation 1s infinite' : 'none'};

  @keyframes flowAnimation {
    0% {
      stroke-dashoffset: 24;
    }
    100% {
      stroke-dashoffset: 0;
    }
  }
`;

const defaultWorkflowSteps = [
  {
    id: 'connect',
    type: 'linkedin_connect',
    label: 'Connect on LinkedIn',
    description: 'Send a connection request to the candidate',
    config: {
      message: 'Hello {{candidate.firstName}}, I would like to connect with you regarding an opportunity.'
    }
  },
  {
    id: 'wait',
    type: 'wait_for_status',
    label: 'Wait for Connection',
    description: 'Wait for the candidate to accept the connection request',
    config: {
      status: 'connected',
      timeoutDays: 3
    }
  },
  {
    id: 'message',
    type: 'linkedin_message',
    label: 'Send Follow-up Message',
    description: 'Send a follow-up message once connected',
    config: {
      message: 'Thank you for connecting! I would love to discuss potential opportunities with you.'
    }
  }
];

const initialNodes = [
  { 
    id: '1', 
    type: 'input', 
    data: { 
      label: 'Start Campaign',
      description: 'Campaign initialization'
    }, 
    position: { x: 250, y: 5 } 
  },
  ...defaultWorkflowSteps.map((step, index) => ({
    id: `${index + 2}`,
    data: { 
      label: step.label,
      description: step.description,
      type: step.type,
      config: step.config
    },
    position: { x: 250, y: 100 + (index * 100) }
  })),
  { 
    id: '5', 
    type: 'output', 
    data: { 
      label: 'End Campaign',
      description: 'Campaign completion'
    }, 
    position: { x: 250, y: 400 } 
  }
];

const initialEdges = [
  { id: 'e1-2', source: '1', target: '2', animated: true },
  { id: 'e2-3', source: '2', target: '3', animated: true },
  { id: 'e3-4', source: '3', target: '4', animated: true },
  { id: 'e4-5', source: '4', target: '5', animated: true }
];

const CustomNode = ({ data, type }: NodeProps) => {
  const isStart = type === 'input';
  const isEnd = type === 'output';
  
  return (
    <StyledNode $isStart={isStart} $isEnd={isEnd}>
      <NodeHeader>{data.label}</NodeHeader>
      {data.type && (
        <NodeType color={isStart || isEnd ? '#fff' : undefined}>
          {data.type.replace(/_/g, ' ')}
        </NodeType>
      )}
      {data.description && (
        <NodeDescription color={isStart || isEnd ? '#fff' : undefined}>
          {data.description}
        </NodeDescription>
      )}
    </StyledNode>
  );
};

const CustomEdge = ({ data, animated }: EdgeProps) => (
  <Edge animated={animated}>{data?.label}</Edge>
);

interface StepConfig {
  message?: string;
  status?: string;
  timeoutDays?: number;
}

interface StepEditorProps {
  node: WorkflowNode;
  onUpdate: (nodeId: string, updates: Partial<NodeData>) => void;
  onDelete: (node: WorkflowNode) => void;
}

const StepEditor: React.FC<StepEditorProps> = ({ node, onUpdate, onDelete }) => {
  const [config, setConfig] = useState<StepConfig>(node.data.config || {});

  const handleConfigChange = (key: keyof StepConfig, value: string | number) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    onUpdate(node.id, { ...node.data, config: newConfig });
  };

  return (
    <div className="p-4 space-y-4">
      <h3 className="text-lg font-medium text-gray-900">Step Configuration</h3>
      
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Label
          <input
            type="text"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            value={node.data.label}
            onChange={(e) => onUpdate(node.id, { ...node.data, label: e.target.value })}
          />
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Description
          <textarea
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            value={node.data.description || ''}
            onChange={(e) => onUpdate(node.id, { ...node.data, description: e.target.value })}
            rows={2}
          />
        </label>
      </div>

      {node.data.type === 'linkedin_connect' && (
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Connection Message
            <textarea
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              value={config.message || ''}
              onChange={(e) => handleConfigChange('message', e.target.value)}
              placeholder="Hello {{candidate.firstName}}, I would like to connect..."
              rows={3}
            />
          </label>
        </div>
      )}

      {node.data.type === 'wait_for_status' && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Status to Wait For
              <select
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                value={config.status || 'connected'}
                onChange={(e) => handleConfigChange('status', e.target.value)}
              >
                <option value="connected">Connected</option>
                <option value="replied">Replied</option>
                <option value="accepted">Accepted</option>
              </select>
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Timeout (days)
              <input
                type="number"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                value={config.timeoutDays || 3}
                onChange={(e) => handleConfigChange('timeoutDays', parseInt(e.target.value))}
                min={1}
                max={30}
              />
            </label>
          </div>
        </>
      )}

      {node.data.type === 'linkedin_message' && (
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Message
            <textarea
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              value={config.message || ''}
              onChange={(e) => handleConfigChange('message', e.target.value)}
              placeholder="Thank you for connecting! I would like to discuss..."
              rows={3}
            />
          </label>
        </div>
      )}

      {!['input', 'output'].includes(node.type || '') && (
        <button
          type="button"
          onClick={() => onDelete(node)}
          className="mt-4 w-full bg-red-100 text-red-700 px-4 py-2 rounded hover:bg-red-200 transition-colors"
        >
          Delete Step
        </button>
      )}
    </div>
  );
};

const CampaignWorkflowEditor = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState<NodeData>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = React.useState<WorkflowNode | null>(null);

  const onConnect = React.useCallback((params) => {
    setEdges((eds) => addEdge({ ...params, animated: true }, eds));
  }, [setEdges]);

  const onNodeDelete = React.useCallback((deletedNode: WorkflowNode) => {
    if (['input', 'output'].includes(deletedNode.type || '')) {
      return; // Prevent deletion of start and end nodes
    }
    setNodes((nds) => nds.filter(node => node.id !== deletedNode.id));
    setEdges((eds) => eds.filter(edge => edge.source !== deletedNode.id && edge.target !== deletedNode.id));
    setSelectedNode(null);
  }, [setNodes, setEdges]);

  const onEdgeDelete = React.useCallback((deletedEdge) => {
    setEdges((eds) => eds.filter(edge => edge.id !== deletedEdge.id));
  }, [setEdges]);

  const addNewStep = React.useCallback((type: string) => {
    const newNodeId = `${Date.now()}`;
    const step = defaultWorkflowSteps.find(s => s.type === type);
    if (!step) return;

    const lastNode = [...nodes].sort((a, b) => 
      (a.position.y || 0) - (b.position.y || 0)
    )[nodes.length - 2]; // -2 to get the last node before the end node

    const newNode = {
      id: newNodeId,
      type: 'default',
      data: {
        label: step.label,
        description: step.description,
        type: step.type,
        config: { ...step.config }
      },
      position: {
        x: 250,
        y: (lastNode?.position.y || 0) + 100
      }
    };

    // Move end node down
    setNodes((nds) => nds.map(node => 
      node.type === 'output' 
        ? { ...node, position: { ...node.position, y: (lastNode?.position.y || 0) + 200 }}
        : node
    ));

    setNodes((nds) => [...nds.slice(0, -1), newNode, nds[nds.length - 1]]);
    
    // Add edge from last node to new node and from new node to end
    setEdges((eds) => [
      ...eds,
      {
        id: `e${lastNode.id}-${newNodeId}`,
        source: lastNode.id,
        target: newNodeId,
        animated: true
      },
      {
        id: `e${newNodeId}-end`,
        source: newNodeId,
        target: nodes[nodes.length - 1].id,
        animated: true
      }
    ]);
  }, [nodes, setNodes, setEdges]);

  const updateNodeData = React.useCallback((nodeId: string, updates: Partial<NodeData>) => {
    setNodes((nds) => 
      nds.map((node) => 
        node.id === nodeId 
          ? { ...node, data: { ...node.data, ...updates } }
          : node
      )
    );
  }, [setNodes]);

  const onSelectionChange = React.useCallback(({ nodes: selectedNodes }) => {
    if (selectedNodes.length === 1) {
      setSelectedNode(selectedNodes[0] as WorkflowNode);
    } else {
      setSelectedNode(null);
    }
  }, []);

  return (
    <Container>
      <ReactFlowProvider>
        <FlowContainer>
          <div className="flex-1 relative">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onSelectionChange={onSelectionChange}
              nodeTypes={{ input: CustomNode, output: CustomNode, default: CustomNode }}
              edgeTypes={{ default: CustomEdge }}
              fitView
              defaultEdgeOptions={{ animated: true }}
            >
              <Controls />
              <Background />
            </ReactFlow>
          </div>
          
          <div className="w-80 border-l border-gray-200 bg-white overflow-y-auto">
            <div className="p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Workflow Steps</h3>
              
              {!selectedNode ? (
                <div className="space-y-4">
                  <p className="text-sm text-gray-500 mb-4">
                    Add new steps to your workflow or click an existing step to edit it.
                  </p>
                  
                  <div className="space-y-2">
                    <button
                      onClick={() => addNewStep('linkedin_connect')}
                      className="w-full px-4 py-2 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors text-sm"
                    >
                      Add LinkedIn Connect
                    </button>
                    <button
                      onClick={() => addNewStep('wait_for_status')}
                      className="w-full px-4 py-2 bg-gray-50 text-gray-700 rounded hover:bg-gray-100 transition-colors text-sm"
                    >
                      Add Wait Step
                    </button>
                    <button
                      onClick={() => addNewStep('linkedin_message')}
                      className="w-full px-4 py-2 bg-green-50 text-green-700 rounded hover:bg-green-100 transition-colors text-sm"
                    >
                      Add LinkedIn Message
                    </button>
                  </div>
                </div>
              ) : (
                <StepEditor
                  node={selectedNode}
                  onUpdate={updateNodeData}
                  onDelete={onNodeDelete}
                />
              )}
            </div>
          </div>
        </FlowContainer>
      </ReactFlowProvider>
    </Container>
  );
};

export default CampaignWorkflowEditor;
