import React, { useState } from 'react';
import {
  Box,
  Typography,
  Checkbox,
  FormControlLabel,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  Grid,
  Chip,
  Alert,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';

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
  const [error, setError] = useState('');

  const enabledFieldNames = formFields.map(f => f.fieldName);

  const toggleStandardField = (field) => {
    if (field.alwaysEnabled) return;

    const isEnabled = enabledFieldNames.includes(field.name);

    if (isEnabled) {
      onChange(formFields.filter(f => f.fieldName !== field.name));
    } else {
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

  const addCustomField = () => {
    if (!customFieldName || !customFieldLabel) {
      setError('Please provide both field name and label');
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
    setError('');
  };

  const removeCustomField = (fieldName) => {
    onChange(formFields.filter(f => f.fieldName !== fieldName));
  };

  const toggleRequired = (fieldName) => {
    onChange(formFields.map(f =>
      f.fieldName === fieldName ? { ...f, isRequired: !f.isRequired } : f
    ));
  };

  const customFields = formFields.filter(f => !f.isStandardZoomField);

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h6" gutterBottom fontWeight="bold">
        Registration Form Fields
      </Typography>

      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom fontWeight="bold">
          Standard Zoom Fields
        </Typography>
        <Grid container spacing={1}>
          {STANDARD_ZOOM_FIELDS.map(field => {
            const isEnabled = enabledFieldNames.includes(field.name);
            const isAlwaysEnabled = field.alwaysEnabled;

            return (
              <Grid item xs={12} sm={6} md={4} key={field.name}>
                <Paper
                  sx={{
                    p: 1.5,
                    bgcolor: isEnabled ? 'primary.light' : 'grey.100',
                    opacity: isEnabled ? 1 : 0.7,
                  }}
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={isEnabled}
                        onChange={() => toggleStandardField(field)}
                        disabled={isAlwaysEnabled}
                        size="small"
                      />
                    }
                    label={
                      <Typography variant="body2">
                        {field.label}
                        {field.required && <Box component="span" sx={{ color: 'error.main' }}> *</Box>}
                        {isAlwaysEnabled && (
                          <Box component="span" sx={{ fontSize: '0.8em', color: 'text.secondary' }}>
                            {' '}(Required)
                          </Box>
                        )}
                      </Typography>
                    }
                  />
                  {isEnabled && !isAlwaysEnabled && (
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formFields.find(f => f.fieldName === field.name)?.isRequired || false}
                          onChange={() => toggleRequired(field.name)}
                          size="small"
                        />
                      }
                      label={<Typography variant="body2">Required</Typography>}
                      sx={{ ml: 4, mt: 0.5 }}
                    />
                  )}
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom fontWeight="bold">
          Custom Fields
        </Typography>
        {customFields.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', mb: 2 }}>
            No custom fields added yet
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
            {customFields.map(field => (
              <Paper key={field.fieldName} sx={{ p: 2, bgcolor: 'warning.light' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="body1" fontWeight="bold">
                      {field.fieldLabel}
                    </Typography>
                    <Chip label={field.fieldType} size="small" sx={{ mr: 1 }} />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={field.isRequired}
                          onChange={() => toggleRequired(field.fieldName)}
                          size="small"
                        />
                      }
                      label={<Typography variant="body2">Required</Typography>}
                    />
                  </Box>
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    startIcon={<DeleteIcon />}
                    onClick={() => removeCustomField(field.fieldName)}
                  >
                    Remove
                  </Button>
                </Box>
              </Paper>
            ))}
          </Box>
        )}

        {!showAddCustomField ? (
          <Button
            variant="contained"
            color="success"
            startIcon={<AddIcon />}
            onClick={() => setShowAddCustomField(true)}
          >
            Add Custom Field
          </Button>
        ) : (
          <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
            <Typography variant="subtitle2" gutterBottom fontWeight="bold">
              Add Custom Field
            </Typography>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <TextField
              fullWidth
              label="Field Name (internal)"
              value={customFieldName}
              onChange={(e) => setCustomFieldName(e.target.value)}
              placeholder="e.g., referralSource"
              size="small"
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Field Label (displayed)"
              value={customFieldLabel}
              onChange={(e) => setCustomFieldLabel(e.target.value)}
              placeholder="e.g., How did you hear about us?"
              size="small"
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
              <InputLabel>Field Type</InputLabel>
              <Select
                value={customFieldType}
                label="Field Type"
                onChange={(e) => setCustomFieldType(e.target.value)}
              >
                <MenuItem value="text">Text</MenuItem>
                <MenuItem value="textarea">Textarea</MenuItem>
                <MenuItem value="email">Email</MenuItem>
                <MenuItem value="tel">Phone</MenuItem>
              </Select>
            </FormControl>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button variant="contained" onClick={addCustomField}>
                Add Field
              </Button>
              <Button
                variant="outlined"
                onClick={() => {
                  setShowAddCustomField(false);
                  setCustomFieldName('');
                  setCustomFieldLabel('');
                  setCustomFieldType('text');
                  setError('');
                }}
              >
                Cancel
              </Button>
            </Box>
          </Paper>
        )}
      </Box>

      <Alert severity="success" icon={false}>
        <Typography variant="body2">
          <strong>Total Fields: {formFields.length}</strong>
          <Box component="span" sx={{ ml: 2 }}>
            Standard: {formFields.filter(f => f.isStandardZoomField).length}
          </Box>
          <Box component="span" sx={{ ml: 2 }}>
            Custom: {customFields.length}
          </Box>
        </Typography>
      </Alert>
    </Box>
  );
}

export default FormBuilder;
