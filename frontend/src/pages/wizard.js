import * as React from 'react';
import { Stack, TextField, Button, Switch, Select, MenuItem, Box, IconButton, Tooltip, InputAdornment } from '@mui/material';
import { FormControl, FormControlLabel, FormLabel, InputLabel, FormHelperText } from '@mui/material';
import { LocalizationProvider, TimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

export default class Wizard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      url: "",
      regexp: "",
      periodicity: {
        hour: "",
        min: "",
        day: ""
      },
      label: "",
      active: true,
      tags: []
    };

    this.handleInputChange = this.handleInputChange.bind(this);
    this.handlePeriodicityChange = this.handlePeriodicityChange.bind(this);
    this.handleCheckedInputChange = this.handleCheckedInputChange.bind(this);
    this.handleTagsInput = this.handleTagsInput.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
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

  handlePeriodicityChange(time, days) {
    let hours = "";
    let mins = "";
    if (time !== null) {
      hours = time.getHours();
      mins= time.getMinutes();
    }

    this.setState({
      periodicity: {
        hour: hours, 
        min: mins, 
        day: days
      }
    });
  }

  handleSubmit() {
    alert(JSON.stringify(this.state));
  }

  render() {
    return (
      <Box sx={{width: "50%", margin: "auto auto", padding: "1%", border: "2px solid black"}}>
        <Stack component="form" onSubmit={this.handleSubmit} spacing={3} justifyContent="center" alignItems="center">
          {/* URL */}
          <FormControl>
            <FormLabel id="url-label">URL</FormLabel>
            <TextField 
              name="url" 
              label="URL" 
              aria-labelledby="url-label" 
              size="small" 
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
              name="regexp" 
              label="Boundary RegExp" 
              aria-labelledby="boundary-regexp-label" 
              size="small" 
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
          {/* Periodicity Input 
          TODO: Fix state flow from child PeriodicityInput
          */}
          <PeriodicityInput setPeriodicity={this.handlePeriodicityChange} />
          {/* Label Input */}
          <FormControl>
            <FormLabel id="label-inp">Label</FormLabel>
            <TextField 
              name="label" 
              label="Label" 
              aria-labelledby="label-inp" 
              size="small" 
              onChange={this.handleInputChange} 
              InputProps={{
                endAdornment: <HelpTooltip title="User given label" adorned />
              }}
            />
          </FormControl>
          {/* Active/Inactive Switch */}
          <FormControl sx={{justifyContent: "center", alignItems: "center"}}>
            <FormLabel id="active-label">
              Active / Inactive
            </FormLabel>
            <FormControlLabel 
              aria-labelledby="active-label" 
              name="active" 
              size="small" 
              label={<HelpTooltip title="If inactive, the site is not crawled based on the Periodicity" />} 
              control={<Switch checked={this.state.active} onChange={this.handleCheckedInputChange} />} 
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
              onChange={this.handleTagsInput} 
              InputProps={{
                endAdornment: <HelpTooltip title="User given tags, comma-separated without additional spaces" adorned />
              }}
            />
          </FormControl>

          <Button variant="outlined" type="submit">Submit</Button>
        </Stack>
      </Box>
    );
  }
}

function PeriodicityInput(props) {
  const [time, setTime] = React.useState(null);
  const [day, setDay] = React.useState("");

  const changePeriodicity = () => props.setPeriodicity(time, day);

  const timeCheck = (newTime) => {
    setTime(newTime);
    // Set Default for Day
    if (newTime && !day) {
      setDay("mon");
    }
    if (!newTime && day) {
      setDay("");
    }
  };

  const dayCheck = (event) => {
    const value = event.target.value;
    setDay(value);
    // Set Default for Time
    if (value && !time) {
      setTime(new Date());
    }
    if (!value && time) {
      setTime(null);
    }
  };

  return (
    <FormControl sx={{justifyContent: "center", alignItems: "center"}}>
        <FormLabel id="time-label">Periodicity </FormLabel>
        <Stack direction="row" spacing={2} aria-labelledby="time-label">
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <FormControl size="small">
              <TimePicker
                name="hour-min"
                label="Hour:Minute" 
                value={time} 
                onChange={(newTime) => {
                  timeCheck(newTime);
                  changePeriodicity();
                }} 
                renderInput={(params) => <TextField {...params} size="small" />}
              />
              <FormHelperText>Hour:Minute of the day</FormHelperText>
            </FormControl>
          </LocalizationProvider>
          <FormControl sx={{ minWidth: 160 }} size="small" >
            <InputLabel id="day-label">Day</InputLabel>
            <Select
              name="day" 
              label="Day" 
              labelId="day-label" 
              variant="outlined" 
              autoWidth 
              value={day} 
              onChange={(event) => {
                dayCheck(event)
                changePeriodicity();
              }}
            >
              <MenuItem value=""><em>None</em></MenuItem>
              <MenuItem value={"mon"}>Monday</MenuItem>
              <MenuItem value={"tue"}>Tuesday</MenuItem>
              <MenuItem value={"wed"}>Wednesday</MenuItem>
              <MenuItem value={"thu"}>Thursday</MenuItem>
              <MenuItem value={"fri"}>Friday</MenuItem>
              <MenuItem value={"sat"}>Saturday</MenuItem>
              <MenuItem value={"sun"}>Sunday</MenuItem>
            </Select>
            <FormHelperText>Day of the week</FormHelperText>
          </FormControl>
        </Stack>
        <FormHelperText>
          <HelpTooltip title="How often should the site be crawled - (hour, minute, day of the week)" />
        </FormHelperText>
      </FormControl>
  );
}

function HelpTooltip(props) {
  const IconTooltip = 
    <Tooltip title={props.title}>
        <IconButton>
          <HelpOutlineIcon />
        </IconButton>
    </Tooltip>
  ;

  if (props.adorned) {
    return (
      <InputAdornment position="end">
        {IconTooltip}
      </InputAdornment>
    );
  }
  else {
    return IconTooltip;
  }
}