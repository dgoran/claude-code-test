import React, { useState } from 'react';

// Standard Zoom fields that can be enabled
const STANDARD_ZOOM_FIELDS = [
  { name: 'firstName', label: 'First Name', type: 'text', zoomKey: 'first_name', required: true, alwaysEnabled: true },
  { name: 'lastName', label: 'Last Name', type: 'text', zoomKey: 'last_name', required: false },
  { name: 'email', label: 'Email', type: 'email', zoomKey: 'email', required: true, alwaysEnabled: true },
  { name: 'phone', label: 'Phone', type: 'tel', zoomKey: 'phone', required: false },
  { name: 'address', label: 'Address', type: 'text', zoomKey: 'address', required: false },
  { name: 'city', label: 'City', type: 'text', zoomKey: 'city', required: false },
  { name: 'country', label: 'Country/Region', type: 'text', zoomKey: 'country', required: false },
  { name: 'zipCode', label: 'Zip/Postal Code', type: 'text', zoomKey: 'zip', required: false },
  { name: 'state', label: 'State/Province', type: 'text', zoomKey: 'state', required: false },
  { name: 'company', label: 'Organization', type: 'text', zoomKey: 'org', required: false },
  { name: 'jobTitle', label: 'Job Title', type: 'text', zoomKey: 'job_title', required: false },
  { name: 'industry', label: 'Industry', type: 'text', zoomKey: 'industry', required: false },
  { name: 'purchasingTimeFrame', label: 'Purchasing Time Frame', type: 'text', zoomKey: 'purchasing_time_frame', required: false },
  { name: 'roleInPurchaseProcess', label: 'Role in Purchase Process', type: 'text', zoomKey: 'role_in_purchase_process', required: false },
  { name: 'numberOfEmployees', label: 'Number of Employees', type: 'text', zoomKey: 'no_of_employees', required: false },
  { name: 'comments', label: 'Questions & Comments', type: 'textarea', zoomKey: 'comments', required: false },
];

function FormBuilder({ formFields, onChange }) {
  const [customFieldName, setCustomFieldName] = useState('');
  const [customFieldLabel, setCustomFieldLabel] = useState('');
  const [customFieldType, setCustomFieldType] = useState('text');
  const [showAddCustomField, setShowAddCustomField] = useState(false);

  // Get enabled field names
  const enabledFieldNames = formFields.map(f => f.fieldName);

  // Toggle a standard Zoom field
  const toggleStandardField = (field) => {
    if (field.alwaysEnabled) return; // Can't disable required fields

    const isEnabled = enabledFieldNames.includes(field.name);

    if (isEnabled) {
      // Remove the field
      onChange(formFields.filter(f => f.fieldName !== field.name));
    } else {
      // Add the field
      const newField = {
        fieldName: field.name,
        fieldLabel: field.label,
        fieldType: field.type,
        isRequired: field.required,
        isStandardZoomField: true,
        zoomFieldKey: field.zoomKey,
        options: [],
        order: formFields.length
      };
      onChange([...formFields, newField]);
    }
  };

  // Add a custom field
  const addCustomField = () => {
    if (!customFieldName || !customFieldLabel) {
      alert('Please provide both field name and label');
      return;
    }

    const newField = {
      fieldName: customFieldName,
      fieldLabel: customFieldLabel,
      fieldType: customFieldType,
      isRequired: false,
      isStandardZoomField: false,
      zoomFieldKey: '',
      options: [],
      order: formFields.length
    };

    onChange([...formFields, newField]);
    setCustomFieldName('');
    setCustomFieldLabel('');
    setCustomFieldType('text');
    setShowAddCustomField(false);
  };

  // Remove a custom field
  const removeCustomField = (fieldName) => {
    onChange(formFields.filter(f => f.fieldName !== fieldName));
  };

  // Toggle required status
  const toggleRequired = (fieldName) => {
    onChange(formFields.map(f =>
      f.fieldName === fieldName ? { ...f, isRequired: !f.isRequired } : f
    ));
  };

  // Get custom fields
  const customFields = formFields.filter(f => !f.isStandardZoomField);

  return (
    <div style={{ marginBottom: '20px' }}>
      <h3>Registration Form Fields</h3>

      <div style={{ marginBottom: '20px' }}>
        <h4>Standard Zoom Fields</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '10px' }}>
          {STANDARD_ZOOM_FIELDS.map(field => {
            const isEnabled = enabledFieldNames.includes(field.name);
            const isAlwaysEnabled = field.alwaysEnabled;

            return (
              <div key={field.name} style={{
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                backgroundColor: isEnabled ? '#e3f2fd' : '#f5f5f5'
              }}>
                <label style={{ display: 'flex', alignItems: 'center', cursor: isAlwaysEnabled ? 'default' : 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={isEnabled}
                    onChange={() => toggleStandardField(field)}
                    disabled={isAlwaysEnabled}
                    style={{ marginRight: '8px' }}
                  />
                  <span>
                    {field.label}
                    {field.required && <span style={{ color: 'red' }}> *</span>}
                    {isAlwaysEnabled && <span style={{ fontSize: '0.8em', color: '#666' }}> (Required)</span>}
                  </span>
                </label>
                {isEnabled && !isAlwaysEnabled && (
                  <label style={{ display: 'block', marginTop: '5px', fontSize: '0.9em' }}>
                    <input
                      type="checkbox"
                      checked={formFields.find(f => f.fieldName === field.name)?.isRequired || false}
                      onChange={() => toggleRequired(field.name)}
                      style={{ marginRight: '5px' }}
                    />
                    Required
                  </label>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h4>Custom Fields</h4>
        {customFields.length === 0 ? (
          <p style={{ color: '#666', fontStyle: 'italic' }}>No custom fields added yet</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {customFields.map(field => (
              <div key={field.fieldName} style={{
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                backgroundColor: '#fff3e0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <strong>{field.fieldLabel}</strong>
                  <span style={{ marginLeft: '10px', fontSize: '0.9em', color: '#666' }}>
                    ({field.fieldType})
                  </span>
                  <label style={{ marginLeft: '15px', fontSize: '0.9em' }}>
                    <input
                      type="checkbox"
                      checked={field.isRequired}
                      onChange={() => toggleRequired(field.fieldName)}
                      style={{ marginRight: '5px' }}
                    />
                    Required
                  </label>
                </div>
                <button
                  type="button"
                  onClick={() => removeCustomField(field.fieldName)}
                  style={{
                    padding: '5px 10px',
                    backgroundColor: '#f44336',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}

        {!showAddCustomField ? (
          <button
            type="button"
            onClick={() => setShowAddCustomField(true)}
            style={{
              marginTop: '10px',
              padding: '10px 20px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Add Custom Field
          </button>
        ) : (
          <div style={{
            marginTop: '10px',
            padding: '15px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            backgroundColor: '#f9f9f9'
          }}>
            <h5>Add Custom Field</h5>
            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Field Name (internal):</label>
              <input
                type="text"
                value={customFieldName}
                onChange={(e) => setCustomFieldName(e.target.value)}
                placeholder="e.g., referralSource"
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Field Label (displayed):</label>
              <input
                type="text"
                value={customFieldLabel}
                onChange={(e) => setCustomFieldLabel(e.target.value)}
                placeholder="e.g., How did you hear about us?"
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Field Type:</label>
              <select
                value={customFieldType}
                onChange={(e) => setCustomFieldType(e.target.value)}
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              >
                <option value="text">Text</option>
                <option value="textarea">Textarea</option>
                <option value="email">Email</option>
                <option value="tel">Phone</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={addCustomField}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#2196F3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Add Field
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddCustomField(false);
                  setCustomFieldName('');
                  setCustomFieldLabel('');
                  setCustomFieldType('text');
                }}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#9E9E9E',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      <div style={{
        padding: '10px',
        backgroundColor: '#e8f5e9',
        border: '1px solid #4CAF50',
        borderRadius: '4px',
        marginTop: '15px'
      }}>
        <strong>Total Fields: {formFields.length}</strong>
        <span style={{ marginLeft: '15px' }}>
          Standard: {formFields.filter(f => f.isStandardZoomField).length}
        </span>
        <span style={{ marginLeft: '15px' }}>
          Custom: {customFields.length}
        </span>
      </div>
    </div>
  );
}

export default FormBuilder;
