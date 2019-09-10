// @flow
import * as React from 'react';
import ObjectGroupsList from '.';
import { ObjectGroupEditorDialog } from '../ObjectGroupEditor/ObjectGroupEditorDialog';
import { type GroupWithContext } from '../ObjectsList/EnumerateObjects';

type Props = {|
  project: ?gdProject,
  globalObjectsContainer: gdObjectsContainer,
  objectsContainer: gdObjectsContainer,
  globalObjectGroups: gdObjectGroupsContainer,
  objectGroups: gdObjectGroupsContainer,
  canRenameGroup: (newName: string) => boolean,
  onDeleteGroup: (
    groupWithScope: GroupWithContext,
    done: (boolean) => void
  ) => void,
  onRenameGroup: (
    groupWithScope: GroupWithContext,
    newName: string,
    done: (boolean) => void
  ) => void,
  onGroupsUpdated?: () => void,
  canSetAsGlobalGroup?: boolean,
|};

type State = {|
  editedGroup: ?gdObjectGroup,
|};

/**
 * Helper showing the list of groups and embedding the editor to edit a group.
 */
export default class ObjectGroupsListWithObjectGroupEditor extends React.Component<
  Props,
  State
> {
  state = {
    editedGroup: null,
  };

  editGroup = (editedGroup: ?gdObjectGroup) => this.setState({ editedGroup });

  render() {
    const {
      project,
      objectsContainer,
      globalObjectsContainer,
      objectGroups,
      globalObjectGroups,
    } = this.props;

    return (
      <React.Fragment>
        <ObjectGroupsList
          globalObjectGroups={globalObjectGroups}
          objectGroups={objectGroups}
          onEditGroup={this.editGroup}
          onDeleteGroup={this.props.onDeleteGroup}
          onRenameGroup={this.props.onRenameGroup}
          canRenameGroup={this.props.canRenameGroup}
          onGroupAdded={this.props.onGroupsUpdated}
          onGroupRemoved={this.props.onGroupsUpdated}
          onGroupRenamed={this.props.onGroupsUpdated}
          canSetAsGlobalGroup={this.props.canSetAsGlobalGroup}
        />
        <ObjectGroupEditorDialog
          project={project}
          key={globalObjectsContainer.ptr + ';' + objectsContainer.ptr}
          open={!!this.state.editedGroup}
          group={this.state.editedGroup}
          globalObjectsContainer={globalObjectsContainer}
          objectsContainer={objectsContainer}
          onCancel={() => this.editGroup(null)}
          onApply={() => {
            if (this.props.onGroupsUpdated) this.props.onGroupsUpdated();
            this.editGroup(null);
          }}
        />
      </React.Fragment>
    );
  }
}
