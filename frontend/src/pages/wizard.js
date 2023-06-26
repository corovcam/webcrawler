import * as React from 'react';
import { Stack, TextField, Button, Switch, Box, IconButton, Tooltip, InputAdornment } from '@mui/material';
import { FormControl, FormControlLabel, FormLabel } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { Navigate } from 'react-router-dom';

export default class Wizard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      url: "",
      boundary_regexp: "",
      periodicity: 0,
      label: "",
      is_active: true,
      tags: [],
      submitted: false,
    };

    this.handleInputChange = this.handleInputChange.bind(this);
    this.handlePeriodicityChange = this.handlePeriodicityChange.bind(this);
    this.handleCheckedInputChange = this.handleCheckedInputChange.bind(this);
    this.handleTagsInput = this.handleTagsInput.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount() {
    const { recordId } = this.props;

    if (recordId?.recordId) {
      fetch(`http://127.0.0.1:3001/website-record/${recordId.recordId}`)
        .then(response => {
          if (response.ok) {
            return response.json();
          } else if (response.status === 404) {
            throw new Error('Record not found');
          } else {
            throw new Error('Error fetching record');
          }
        })
        .then(json => {
          const { websiteRecord } = json;
          this.setState({
            url: websiteRecord.url,
            boundary_regexp: websiteRecord.boundary_regexp,
            periodicity: websiteRecord.periodicity,
            label: websiteRecord.label,
            is_active: websiteRecord.is_active === 1 ? true : false,
            tags: JSON.parse(websiteRecord.tags),
          });
        })
        .catch(error => {
          console.error(error);
          alert('An error occurred while fetching the record.');
        });
    }
  }

  handleInputChange(event) {
    const target = event.target;
    const value = target.value;
    const name = target.name;

    this.setState({
      [name]: value
    });
  }

  handleCheckedInputChange(event) {
    this.setState({
      [event.target.name]: event.target.checked
    });
  }

  handleTagsInput(event) {
    const tags = event.target.value.split(',');
    this.setState({
      [event.target.name]: tags
    });
  }

  handlePeriodicityChange(event) {
    const value = event.target.value;
    const parsedValue = parseInt(value, 10);

    if (parsedValue >= 0) {
      this.setState({
        periodicity: parsedValue
      });
    } else {
      this.setState({
        periodicity: 0
      });
    }
  }

  handleSubmit(event) {
    event.preventDefault();

    const { recordId } = this.props;
    const { url, boundary_regexp, periodicity, label, is_active, tags } = this.state;

    let data = {
      url,
      boundary_regexp,
      periodicity,
      label,
      is_active,
      tags
    };

    let apiUrl = 'http://127.0.0.1:3001/add-website-record';

    if (recordId?.recordId) {
      apiUrl = `http://127.0.0.1:3001/update-website-record`;
      data = {...data, record_id: recordId.recordId}
    }

    fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
      .then(response => {
        if (response.ok) {
          return recordId?.recordId ? response.text() : response.json();
        } else if (response.status === 404) {
          throw new Error('Record not found');
        } else if (response.status === 500) {
          throw new Error('Internal server error');
        } else {
          throw new Error('Error saving record');
        }
      })
      .then(data => {
        if (recordId?.recordId) {
          // UPDATE returns a string
          alert(data); 
        } else {
          // ADD returns JSON
          const { recordId, message } = data;
          alert(`Record saved successfully!\nRecord ID: ${recordId}\nMessage: ${message}`);
        }
        this.setState({
          submitted: true
        });
      })
      .catch(error => {
        console.error(error);
        alert('An error occurred while saving the record.');
      });
  }

  render() {
    const { recordId } = this.props;
    const { url, boundary_regexp, periodicity, label, is_active, tags, submitted } = this.state;

    return (
      <>
      {submitted && (<Navigate to="/view" replace={true} />)}
      <Box sx={{ width: "50%", margin: "auto auto", padding: "1%", border: "2px solid black", borderRadius: '16px' }}>
        <Stack component="form" onSubmit={(event) => this.handleSubmit(event)} spacing={3} justifyContent="center" alignItems="center">
          {/* URL */}
          <FormControl fullWidth>
            <FormLabel id="url-label">URL</FormLabel>
            <TextField
              name="url"
              label="URL"
              aria-labelledby="url-label"
              size="small"
              value={url}
              onChange={this.handleInputChange}
              required
              InputProps={{
                endAdornment: <HelpTooltip title="Specify where the crawler should start" adorned />
              }}
            />
          </FormControl>
          {/* Boundary RegExp */}
          <FormControl>
            <FormLabel id="boundary-regexp-label">Boundary RegExp</FormLabel>
            <TextField
              name="boundary_regexp"
              label="Boundary RegExp"
              aria-labelledby="boundary-regexp-label"
              size="small"
              value={boundary_regexp}
              onChange={this.handleInputChange}
              required
              InputProps={{
                endAdornment:
                  <HelpTooltip
                    title="When the crawler found a link, the link must match this expression in order to be followed"
                    adorned
                  />
              }}
            />
          </FormControl>
          {/* Periodicity Input */}
          <FormControl>
            <FormLabel id="periodicity-label">Periodicity (minutes)</FormLabel>
            <TextField
              name="periodicity"
              label="Periodicity"
              aria-labelledby="periodicity-label"
              size="small"
              value={periodicity}
              onChange={this.handlePeriodicityChange}
              type="number"
              InputProps={{
                endAdornment: <HelpTooltip title="How often should the site be crawled (in minutes)" adorned />
              }}
            />
          </FormControl>
          {/* Label Input */}
          <FormControl>
            <FormLabel id="label-inp">Label</FormLabel>
            <TextField
              name="label"
              label="Label"
              aria-labelledby="label-inp"
              size="small"
              value={label}
              onChange={this.handleInputChange}
              InputProps={{
                endAdornment: <HelpTooltip title="User given label" adorned />
              }}
            />
          </FormControl>
          {/* Active/Inactive Switch */}
          <FormControl sx={{ justifyContent: "center", alignItems: "center" }}>
            <FormLabel id="active-label">
              Active / Inactive
            </FormLabel>
            <FormControlLabel
              aria-labelledby="active-label"
              name="is_active"
              size="small"
              label={<HelpTooltip title="If inactive, the site is not crawled based on the Periodicity" />}
              control={<Switch checked={is_active} onChange={this.handleCheckedInputChange} />}
            />
          </FormControl>
          {/* Tags Input */}
          <FormControl>
            <FormLabel id="tags-label">Tags (comma separated)</FormLabel>
            <TextField
              name="tags"
              label="Tags"
              aria-labelledby="tags-label"
              size="small"
              value={tags.join(',')}
              onChange={this.handleTagsInput}
              InputProps={{
                endAdornment: <HelpTooltip title="User given tags, comma-separated without additional spaces" adorned />
              }}
            />
          </FormControl>
          <Button variant="outlined" type="submit">{recordId ? 'Update' : 'Submit'}</Button>
        </Stack>
      </Box>
      </>
    );
  }
}

function HelpTooltip(props) {
  const IconTooltip = () => {
    return (
      <Tooltip title={props.title}>
        <IconButton>
          <HelpOutlineIcon />
        </IconButton>
      </Tooltip>
    );
  };

  if (props.adorned) {
    return (
      <InputAdornment position="end">
        {IconTooltip()}
      </InputAdornment>
    );
  }
  else {
    return IconTooltip();
  }
}
