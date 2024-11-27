import React from 'react';
import CampaignWorkflowEditor from './CampaignWorkflowEditor';

const CampaignCreationForm = () => {
  return (
    <div>
      <h2>Create Campaign</h2>
      <form>
        <div>
          <label htmlFor="campaignName">Campaign Name:</label>
          <input type="text" id="campaignName" name="campaignName" />
        </div>
        <div>
          <label htmlFor="campaignDescription">Campaign Description:</label>
          <textarea id="campaignDescription" name="campaignDescription" />
        </div>
        <div>
          <h3>Workflow Editor</h3>
          <CampaignWorkflowEditor />
        </div>
        <button type="submit">Create Campaign</button>
      </form>
    </div>
  );
};

export default CampaignCreationForm;
