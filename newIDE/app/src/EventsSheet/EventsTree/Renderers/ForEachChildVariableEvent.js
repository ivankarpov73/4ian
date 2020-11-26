// @flow
import * as React from 'react';
import InstructionsList from '../InstructionsList.js';
import classNames from 'classnames';
import {
  selectableArea,
  executableEventContainer,
  disabledText,
  instructionParameter,
  nameAndIconContainer,
  icon,
} from '../ClassNames';
import InlinePopover from '../../InlinePopover';
import SceneVariableField from '../../ParameterFields/SceneVariableField';
import { type EventRendererProps } from './EventRenderer';
import ConditionsActionsColumns from '../ConditionsActionsColumns';
import { Trans } from '@lingui/macro';
import { shouldActivate } from '../../../UI/KeyboardShortcuts/InteractionKeys.js';
const gd: libGDevelop = global.gd;

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
  },
  instructionsContainer: {
    display: 'flex',
  },
  actionsList: {
    flex: 1,
  },
  variableContainer: {
    marginLeft: '3px',
    marginRight: '2px',
  },
};

type State = {|
  editingIteratorVariableName: boolean,
  editingIterableVariableName: boolean,
  anchorEl: ?HTMLSpanElement,
|};

export default class ForEachChildVariableEvent extends React.Component<
  EventRendererProps,
  State
> {
  _iteratorField: ?SceneVariableField = null;
  _iterableField: ?SceneVariableField = null;
  state = {
    editingIteratorVariableName: false,
    editingIterableVariableName: false,
    anchorEl: null,
  };

  edit = (variable: 'iterable' | 'iterator', anchorEl: HTMLSpanElement) => {
    // We should not need to use a timeout, but
    // if we don't do this, the InlinePopover's clickaway listener
    // is immediately picking up the event and closing.
    // Search the rest of the codebase for inlinepopover-event-hack
    setTimeout(
      () =>
        this.setState(
          {
            editingIteratorVariableName: variable === 'iterator',
            editingIterableVariableName: variable === 'iterable',
            anchorEl,
          },
          () => {
            // Give a bit of time for the popover to mount itself
            setTimeout(() => {
              const field =
                variable === 'iterable'
                  ? this._iterableField
                  : this._iteratorField;
              if (field) field.focus();
            }, 10);
          }
        ),
      10
    );
  };

  endEditing = () => {
    const { anchorEl } = this.state;
    // Put back the focus after closing the inline popover.
    // $FlowFixMe
    if (anchorEl) anchorEl.focus();

    this.setState({
      editingIteratorVariableName: false,
      editingIterableVariableName: false,
      anchorEl: null,
    });
  };

  render() {
    const forEachChildVariableEvent = gd.asForEachChildVariableEvent(
      this.props.event
    );
    const iteratorName = forEachChildVariableEvent.getIteratorVariableName();
    const iterableName = forEachChildVariableEvent.getIterableVariableName();

    return (
      <div
        style={styles.container}
        className={classNames({
          [executableEventContainer]: true,
        })}
      >
        <div>
          <span
            className={classNames({
              [disabledText]: this.props.disabled,
            })}
            tabIndex={0}
          >
            <Trans>For every child in </Trans>
            <span
              className={classNames({
                [selectableArea]: true,
                [instructionParameter]: true,
                [nameAndIconContainer]: true,
                scenevar: true,
              })}
              style={styles.variableContainer}
              onClick={e => this.edit('iterable', e.currentTarget)}
              onKeyPress={event => {
                if (shouldActivate(event)) {
                  this.edit('iterable', event.currentTarget);
                }
              }}
            >
              <img className={icon} src="res/types/scenevar.png" alt="" />
              {iterableName.length !== 0 ? (
                <span>{iterableName}</span>
              ) : (
                <span className="instruction-missing-parameter">
                  <Trans>{`<Select a variable>`}</Trans>
                </span>
              )}
            </span>
            <Trans>, store the child in variable </Trans>
            <span
              className={classNames({
                [selectableArea]: true,
                [instructionParameter]: true,
                [nameAndIconContainer]: true,
                scenevar: true,
              })}
              style={styles.variableContainer}
              onClick={e => this.edit('iterator', e.currentTarget)}
              onKeyPress={event => {
                if (shouldActivate(event)) {
                  this.edit('iterator', event.currentTarget);
                }
              }}
            >
              <img className={icon} src="res/types/scenevar.png" alt="" />
              {iteratorName.length !== 0 ? (
                <span>{iteratorName}</span>
              ) : (
                <span className="instruction-missing-parameter">
                  <Trans>{`<Select a variable>`}</Trans>
                </span>
              )}
            </span>
            <Trans> and do:</Trans>
          </span>
        </div>
        <ConditionsActionsColumns
          leftIndentWidth={this.props.leftIndentWidth}
          windowWidth={this.props.windowWidth}
          renderConditionsList={({ style, className }) => (
            <InstructionsList
              instrsList={forEachChildVariableEvent.getConditions()}
              style={style}
              className={className}
              selection={this.props.selection}
              areConditions
              onAddNewInstruction={this.props.onAddNewInstruction}
              onPasteInstructions={this.props.onPasteInstructions}
              onMoveToInstruction={this.props.onMoveToInstruction}
              onMoveToInstructionsList={this.props.onMoveToInstructionsList}
              onInstructionClick={this.props.onInstructionClick}
              onInstructionDoubleClick={this.props.onInstructionDoubleClick}
              onInstructionContextMenu={this.props.onInstructionContextMenu}
              onAddInstructionContextMenu={
                this.props.onAddInstructionContextMenu
              }
              onParameterClick={this.props.onParameterClick}
              disabled={this.props.disabled}
              renderObjectThumbnail={this.props.renderObjectThumbnail}
              screenType={this.props.screenType}
              windowWidth={this.props.windowWidth}
            />
          )}
          renderActionsList={({ className }) => (
            <InstructionsList
              instrsList={forEachChildVariableEvent.getActions()}
              style={
                {
                  ...styles.actionsList,
                } /* TODO: Use a new object to force update - somehow updates are not always propagated otherwise */
              }
              className={className}
              selection={this.props.selection}
              areConditions={false}
              onAddNewInstruction={this.props.onAddNewInstruction}
              onPasteInstructions={this.props.onPasteInstructions}
              onMoveToInstruction={this.props.onMoveToInstruction}
              onMoveToInstructionsList={this.props.onMoveToInstructionsList}
              onInstructionClick={this.props.onInstructionClick}
              onInstructionDoubleClick={this.props.onInstructionDoubleClick}
              onInstructionContextMenu={this.props.onInstructionContextMenu}
              onAddInstructionContextMenu={
                this.props.onAddInstructionContextMenu
              }
              onParameterClick={this.props.onParameterClick}
              disabled={this.props.disabled}
              renderObjectThumbnail={this.props.renderObjectThumbnail}
              screenType={this.props.screenType}
              windowWidth={this.props.windowWidth}
            />
          )}
        />
        <InlinePopover
          open={this.state.editingIteratorVariableName}
          anchorEl={this.state.anchorEl}
          onRequestClose={this.endEditing}
        >
          <SceneVariableField
            project={this.props.project}
            scope={this.props.scope}
            globalObjectsContainer={this.props.globalObjectsContainer}
            objectsContainer={this.props.objectsContainer}
            value={iteratorName}
            onChange={text => {
              forEachChildVariableEvent.setIteratorVariableName(text);
              this.props.onUpdate();
            }}
            isInline
            onRequestClose={this.endEditing}
            ref={iteratorField => (this._iteratorField = iteratorField)}
          />
        </InlinePopover>
        <InlinePopover
          open={this.state.editingIterableVariableName}
          anchorEl={this.state.anchorEl}
          onRequestClose={this.endEditing}
        >
          <SceneVariableField
            project={this.props.project}
            scope={this.props.scope}
            globalObjectsContainer={this.props.globalObjectsContainer}
            objectsContainer={this.props.objectsContainer}
            value={iterableName}
            onChange={text => {
              forEachChildVariableEvent.setIterableVariableName(text);
              this.props.onUpdate();
            }}
            isInline
            onRequestClose={this.endEditing}
            ref={iterableField => (this._iterableField = iterableField)}
          />
        </InlinePopover>
      </div>
    );
  }
}
