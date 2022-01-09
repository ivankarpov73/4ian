// @flow
import * as React from 'react';
import { ListItem } from '../List';
import ListIcon from '../ListIcon';
import TextField, { noMarginTextFieldInListItemTopOffset } from '../TextField';
import ThemeConsumer from '../Theme/ThemeConsumer';
import { type MenuItemTemplate } from '../Menu/Menu.flow';
import { shouldValidate } from '../KeyboardShortcuts/InteractionKeys';
import { textEllispsisStyle } from '../TextEllipsis';
import { Badge } from '@material-ui/core';

const styles = {
  textField: {
    top: noMarginTextFieldInListItemTopOffset,
  },
};

const LEFT_MOUSE_BUTTON = 0;

type Props<Item> = {
  item: Item,
  itemName: string,
  isBold: boolean,
  onRename: string => void,
  editingName: boolean,
  getThumbnail?: () => string,
  getBadge?: () => string,
  selected: boolean,
  onItemSelected: (?Item) => void,
  errorStatus: '' | 'error' | 'warning',
  buildMenuTemplate: () => Array<MenuItemTemplate>,
  onEdit?: ?(Item) => void,
  hideMenuButton: boolean,
  scaleUpItemIconWhenSelected?: boolean,
  connectIconDragSource?: ?(React.Element<any>) => ?React.Node,
};

class ItemRow<Item> extends React.Component<Props<Item>> {
  textField: ?TextField;

  componentDidUpdate(prevProps: Props<Item>) {
    if (!prevProps.editingName && this.props.editingName) {
      setTimeout(() => {
        if (this.textField) this.textField.focus();
      }, 100);
    }
  }

  render() {
    const {
      item,
      itemName,
      isBold,
      selected,
      getThumbnail,
      getBadge,
      errorStatus,
      onEdit,
      onItemSelected,
      hideMenuButton,
      scaleUpItemIconWhenSelected,
      connectIconDragSource,
    } = this.props;

    return (
      <ThemeConsumer>
        {muiTheme => {
          const label = this.props.editingName ? (
            <TextField
              id="rename-item-field"
              margin="none"
              ref={textField => (this.textField = textField)}
              defaultValue={itemName}
              onBlur={e => this.props.onRename(e.currentTarget.value)}
              onKeyPress={event => {
                if (shouldValidate(event)) {
                  if (this.textField) this.textField.blur();
                }
              }}
              fullWidth
              style={styles.textField}
            />
          ) : (
            <div
              title={itemName}
              style={{
                ...textEllispsisStyle,
                color: selected
                  ? muiTheme.listItem.selectedTextColor
                  : undefined,
                fontStyle: isBold ? 'italic' : undefined,
                fontWeight: isBold ? 'bold' : 'normal',
              }}
            >
              {itemName}
            </div>
          );

          const itemStyle = {
            borderBottom: `1px solid ${muiTheme.listItem.separatorColor}`,
            backgroundColor: selected
              ? errorStatus === ''
                ? muiTheme.listItem.selectedBackgroundColor
                : errorStatus === 'error'
                ? muiTheme.listItem.selectedErrorBackgroundColor
                : muiTheme.listItem.selectedWarningBackgroundColor
              : undefined,
            color:
              errorStatus === ''
                ? undefined
                : errorStatus === 'error'
                ? muiTheme.listItem.errorTextColor
                : muiTheme.listItem.warningTextColor,
          };

          const leftContent = () => {
            if (getBadge && getThumbnail) {
              return (
                <Badge badgeContent={25} classes={getBadge} >
                <ListIcon
                  iconSize={24}
                  src={getThumbnail()}
                  cssAnimation={
                    scaleUpItemIconWhenSelected && selected
                      ? 'scale-and-jiggle 0.8s forwards'
                      : ''
                  }
                />
              </Badge>
              )
            }
            else if (!getBadge && getThumbnail) {
              return (
                <ListIcon
                  iconSize={24}
                  src={getThumbnail()}
                  cssAnimation={
                    scaleUpItemIconWhenSelected && selected
                      ? 'scale-and-jiggle 0.8s forwards'
                      : ''
                  }
                />
              )
            }
            else {
              return
            }
            
            };

          return (
            <ListItem
              style={{ ...itemStyle }}
              primaryText={label}
              leftIcon={
                connectIconDragSource && leftContent()
                  ? connectIconDragSource(<div>{leftContent()}</div>)
                  : leftContent()
              }
              displayMenuButton={!hideMenuButton}
              rightIconColor={
                selected
                  ? muiTheme.listItem.selectedRightIconColor
                  : muiTheme.listItem.rightIconColor
              }
              buildMenuTemplate={this.props.buildMenuTemplate}
              onClick={() => {
                if (!onItemSelected) return;
                if (this.props.editingName) return;

                onItemSelected(selected ? null : item);
              }}
              onDoubleClick={event => {
                if (event.button !== LEFT_MOUSE_BUTTON) return;
                if (!onEdit) return;
                if (this.props.editingName) return;

                onItemSelected(null);
                onEdit(item);
              }}
            />
          );
        }}
      </ThemeConsumer>
    );
  }
}

export default ItemRow;
