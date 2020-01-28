/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#ifndef GDCORE_EVENTSREFACTORER_H
#define GDCORE_EVENTSREFACTORER_H
#include <memory>
#include <vector>
#include "GDCore/Events/Instruction.h"
#include "GDCore/String.h"
namespace gd {
class EventsList;
class ObjectsContainer;
class Platform;
class ExternalEvents;
class BaseEvent;
class Instruction;
typedef std::shared_ptr<gd::BaseEvent> BaseEventSPtr;
}

namespace gd {

/**
 * \brief Class used to return result when calling
 EventsRefactorer::SearchInEvents
 *
  \see EventsRefactorer::SearchInEvents
 */
class GD_CORE_API EventsSearchResult {
 public:
  EventsSearchResult(std::weak_ptr<gd::BaseEvent> event_,
                     gd::EventsList* eventsList_,
                     std::size_t positionInList_);
  EventsSearchResult();
  ~EventsSearchResult(){};

  std::weak_ptr<gd::BaseEvent> event;
  gd::EventsList* eventsList;
  std::size_t positionInList;

  bool IsEventsListValid() const { return eventsList != nullptr; }
  
  /**
   * \brief Get the events list containing the event pointed by the EventsSearchResult.
   * \warning Only call this when IsEventsListValid returns true.
   */
  const gd::EventsList & GetEventsList() const { return *eventsList; }

  std::size_t GetPositionInList() const { return positionInList; }
  
  bool IsEventValid() const { return !event.expired(); }

  /**
   * \brief Get the event pointed by the EventsSearchResult.
   * \warning Only call this when IsEventValid returns true.
   */
  const gd::BaseEvent & GetEvent() const { return *event.lock(); }
};

/**
 * \brief Class containing functions to do refactoring tasks on events.
 *
 * Class containing functions to do refactoring tasks on events
 * like changing an object name, deleting an object...
 *
 * \todo Refactor this class using ArbitraryEventsWorker!
 *
 * \ingroup IDE
 */
class GD_CORE_API EventsRefactorer {
 public:
  /**
   * Replace all occurences of an object name by another name
   * ( include : objects in parameters and in math/text expressions of all
   * events ).
   */
  static void RenameObjectInEvents(const gd::Platform& platform,
                                   gd::ObjectsContainer& project,
                                   gd::ObjectsContainer& layout,
                                   gd::EventsList& events,
                                   gd::String oldName,
                                   gd::String newName);

  /**
   * Remove all actions or conditions using an object
   */
  static void RemoveObjectInEvents(const gd::Platform& platform,
                                   gd::ObjectsContainer& project,
                                   gd::ObjectsContainer& layout,
                                   gd::EventsList& events,
                                   gd::String name);

  /**
   * Search for a gd::String in events
   *
   * \return A vector containing EventsSearchResult objects filled with events
   * containing the string
   */
  static std::vector<EventsSearchResult> SearchInEvents(gd::ObjectsContainer& project,
                                                        gd::ObjectsContainer& layout,
                                                        gd::EventsList& events,
                                                        gd::String search,
                                                        bool matchCase,
                                                        bool inConditions,
                                                        bool inActions,
                                                        bool inComments);

  /**
   * Replace all occurrences of a gd::String in events
   */
  static void ReplaceStringInEvents(gd::ObjectsContainer& project,
                                    gd::ObjectsContainer& layout,
                                    gd::EventsList& events,
                                    gd::String toReplace,
                                    gd::String newString,
                                    bool matchCase,
                                    bool inConditions,
                                    bool inActions);

  virtual ~EventsRefactorer(){};

 private:
  /**
   * Replace all occurences of an object name by another name in an action
   * ( include : objects in parameters and in math/text expressions ).
   *
   * \return true if something was modified.
   */
  static bool RenameObjectInActions(const gd::Platform& platform,
                                    gd::ObjectsContainer& project,
                                    gd::ObjectsContainer& layout,
                                    gd::InstructionsList& instructions,
                                    gd::String oldName,
                                    gd::String newName);

  /**
   * Replace all occurences of an object name by another name in a condition
   * ( include : objects in parameters and in math/text expressions ).
   *
   * \return true if something was modified.
   */
  static bool RenameObjectInConditions(const gd::Platform& platform,
                                       gd::ObjectsContainer& project,
                                       gd::ObjectsContainer& layout,
                                       gd::InstructionsList& instructions,
                                       gd::String oldName,
                                       gd::String newName);

  /**
   * Remove all conditions of the list using an object
   *
   * \return true if something was modified.
   */
  static bool RemoveObjectInConditions(const gd::Platform& platform,
                                       gd::ObjectsContainer& project,
                                       gd::ObjectsContainer& layout,
                                       gd::InstructionsList& conditions,
                                       gd::String name);

  /**
   * Remove all actions of the list using an object
   *
   * \return true if something was modified.
   */
  static bool RemoveObjectInActions(const gd::Platform& platform,
                                    gd::ObjectsContainer& project,
                                    gd::ObjectsContainer& layout,
                                    gd::InstructionsList& conditions,
                                    gd::String name);

  /**
   * Replace all occurences of a gd::String in conditions
   *
   * \return true if something was modified.
   */
  static bool ReplaceStringInConditions(gd::ObjectsContainer& project,
                                        gd::ObjectsContainer& layout,
                                        gd::InstructionsList& conditions,
                                        gd::String toReplace,
                                        gd::String newString,
                                        bool matchCase);

  /**
   * Replace all occurences of a gd::String in actions
   *
   * \return true if something was modified.
   */
  static bool ReplaceStringInActions(gd::ObjectsContainer& project,
                                     gd::ObjectsContainer& layout,
                                     gd::InstructionsList& conditions,
                                     gd::String toReplace,
                                     gd::String newString,
                                     bool matchCase);

  static bool SearchStringInActions(gd::ObjectsContainer& project,
                                    gd::ObjectsContainer& layout,
                                    gd::InstructionsList& actions,
                                    gd::String search,
                                    bool matchCase);
  static bool SearchStringInConditions(gd::ObjectsContainer& project,
                                       gd::ObjectsContainer& layout,
                                       gd::InstructionsList& conditions,
                                       gd::String search,
                                       bool matchCase);
  static bool GetAllSearchableStrings(gd::ObjectsContainer& project,
                                       gd::ObjectsContainer& layout,
                                       gd::EventsList& events,
                                       gd::String search,
                                       bool matchCase);

  EventsRefactorer(){};
};

}  // namespace gd

#endif  // GDCORE_EVENTSREFACTORER_H
