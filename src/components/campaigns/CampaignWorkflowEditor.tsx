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

const StyledNode = styled.div`
  padding: 10px;
  border-radius: 5px;
  background: #fff;
  border: 1px solid #ccc;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Edge = styled.div`
  background: #ccc;
  border-radius: 2px;
  height: 2px;
`;

const initialNodes = [
  { id: '1', type: 'input', data: { label: 'Start' }, position: { x: 250, y: 5 } },
  { id: '2', data: { label: 'Step 1' }, position: { x: 100, y: 100 } },
  { id: '3', data: { label: 'Step 2' }, position: { x: 400, y: 100 } },
  { id: '4', type: 'output', data: { label: 'End' }, position: { x: 250, y: 200 } },
];

const initialEdges = [
  { id: 'e1-2', source: '1', target: '2' },
  { id: 'e2-3', source: '2', target: '3' },
  { id: 'e3-4', source: '3', target: '4' },
];

const CustomNode = ({ data }: NodeProps) => (
  <StyledNode>{data.label}</StyledNode>
);

const CustomEdge = ({ data }: EdgeProps) => (
  <Edge>{data.label}</Edge>
);

const CampaignWorkflowEditor = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState<NodeData>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = React.useState<WorkflowNode | null>(null);

  const onConnect = (params) => setEdges((eds) => addEdge(params, eds));

  const onNodeDelete = (deletedNode) => {
    setNodes((nds) => nds.filter(node => node.id !== deletedNode.id));
    setEdges((eds) => eds.filter(edge => edge.source !== deletedNode.id && edge.target !== deletedNode.id));
    setSelectedNode(null);
  };

  const onEdgeDelete = (deletedEdge) => {
    setEdges((eds) => eds.filter(edge => edge.id !== deletedEdge.id));
  };

  const addNewNode = () => {
    const newNode = {
      id: `${nodes.length + 1}`,
      data: { 
        label: `Step ${nodes.length + 1}`,
        description: ''
      },
      position: { x: 250, y: 250 + (nodes.length * 50) },
    };
    setNodes((nds) => nds.concat(newNode));
  };

  const updateNodeLabel = (nodeId: string, newLabel: string) => {
    setNodes((nds) => 
      nds.map((node) => 
        node.id === nodeId 
          ? { ...node, data: { ...node.data, label: newLabel } }
          : node
      )
    );
  };

  const updateNodeDescription = (nodeId: string, newDescription: string) => {
    setNodes((nds) => 
      nds.map((node) => 
        node.id === nodeId 
          ? { ...node, data: { ...node.data, description: newDescription } }
          : node
      )
    );
  };

  const onSelectionChange = ({ nodes: selectedNodes, edges: selectedEdges }) => {
    if (selectedNodes.length === 1) {
      setSelectedNode(selectedNodes[0]);
    } else {
      setSelectedNode(null);
    }
  };

  return (
    <Container>
      <ReactFlowProvider>
        <FlowContainer>
          <div style={{ flex: '1', position: 'relative' }}>
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
            >
              <MiniMap />
              <Controls />
              <Background />
            </ReactFlow>
          </div>
          
          {selectedNode && (
            <div style={{ width: '300px', padding: '20px', borderLeft: '1px solid #ccc', overflowY: 'auto' }}>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Step Details</h3>
              <form>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Step Label
                      <input
                        type="text"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        value={selectedNode.data.label || ''}
                        onChange={(e) => updateNodeLabel(selectedNode.id, e.target.value)}
                      />
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Step Description
                      <textarea
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        value={selectedNode.data.description || ''}
                        onChange={(e) => updateNodeDescription(selectedNode.id, e.target.value)}
                        rows={4}
                      />
                    </label>
                  </div>
                  <button
                    type="button"
                    className="w-full bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
                    onClick={() => onNodeDelete(selectedNode)}
                  >
                    Delete Step
                  </button>
                </div>
              </form>
            </div>
          )}
        </FlowContainer>
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={addNewNode}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            Add New Step
          </button>
        </div>
      </ReactFlowProvider>
    </Container>
  );
};

export default CampaignWorkflowEditor;
