// @flow
import * as React from 'react';
import { I18n } from '@lingui/react';
import TextField from '@material-ui/core/TextField';
import { type MessageDescriptor } from '../Utils/i18n/MessageDescriptor.flow';
import ListIcon from './ListIcon';
import muiZIndex from '@material-ui/core/styles/zIndex';
import SvgIcon from '@material-ui/core/SvgIcon';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import { computeTextFieldStyleProps } from './TextField';
import { MarkdownText } from './MarkdownText';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { makeStyles } from '@material-ui/core/styles';



export type DataSource = Array<
  | {|
      type: 'separator',
    |}
  | {|
      text: string, // The text used for filtering. If empty, item is always shown.
      value: string, // The value to show on screen and to be selected
      onClick?: () => void, // If defined, will be called when the item is clicked. onChange/onChoose won't be called.
      renderIcon?: ?() => React.Element<typeof ListIcon | typeof SvgIcon>,
    |}
>;

const styles = makeStyles({
  container: {
    position: 'relative',
  },
  root: {
    flexWrap: "wrap",
    '& .MuiAutocomplete-inputRoot .MuiAutocomplete-input': {
      flexGrow: 1,
      width: "auto",
    }
  }
});




type Props = {|
  value: string,
  onChange: string => void,
  onChoose?: string => void,
  dataSource: DataSource,

  id?: string,
  onBlur?: (event: {|
    currentTarget: {|
      value: string,
    |},
  |}) => void,
  errorText?: React.Node,
  disabled?: boolean,
  floatingLabelText?: React.Node,
  helperMarkdownText?: ?string,
  hintText?: MessageDescriptor | string,
  fullWidth?: boolean,
  margin?: 'none' | 'dense',
  textFieldStyle?: Object,
  openOnFocus?: boolean,
|};

type State = {|
  inputValue: string | null,
|}

const filterFunction = (option, inputValue) => {
  const lowercaseInputValue = inputValue.toLowerCase();
  if(!option.text) return true;
  if(option.type === 'separator') return true;
  return option.text.toLowerCase().indexOf(lowercaseInputValue) !== -1;
}


export default function SemiControlledAutoComplete(props) {

    const [state, setState] = React.useState({ inputValue: null });
  
    const currentInputValue =
          state.inputValue !== null ? state.inputValue : props.value;
    
    const helperText = props.helperMarkdownText ? (
          <MarkdownText source={props.helperMarkdownText} />
          ) : null;

    const classes = styles();

    
    return(
          <div
          style={{
              ...styles.container,
              flexGrow: props.fullWidth ? 1 : undefined,
          }}>
                  <Autocomplete
                    freeSolo
                    disableClearable
                    options={props.dataSource
                                  .filter(option => filterFunction(option, currentInputValue))
                                  .map(option => option.value)}
                    renderInput={params => (
                      <TextField {...params}
                        classes={{root: classes.root}}
                        label={props.floatingLabelText}
                        error={!!props.errorText}
                        helperText={props.helperText || helperText || props.errorText}
                        disabled={props.disabled}
                        style={props.textFieldStyle}

                        // Todo: Implement i18n for placeholder, couldn't find a workaround. 
                        placeholder={props.hintText}
                        variant="filled" />
                      )}
                    inputValue={currentInputValue}
                    onInputChange={(event, inputValue, reason) => setState({inputValue})}
                    onChange={(event, value) => {
                        const data = props.dataSource
                                          .filter(option => option.value === value);
                        if(data.length !== 0){
                          if(data[0].onClick){
                          data[0].onClick();
                        }                        
                      }
                      props.onChange(value)}}
                  />
            </div>
    )
}