/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */

#include "CommentEvent.h"
#include "GDCore/CommonTools.h"
#include "GDCore/Serialization/SerializerElement.h"

using namespace std;

namespace gd {

vector<const gd::String*> CommentEvent::GetAllSearchableStrings( BaseEvent &event)
    const {
  vector<const gd::String*> allSearchableStrings;

  stringCom1 = event.GetChild("comment", 0, "Com1").GetValue().GetString();
  stringCom2 = event.GetChild("comment", 0, "Com2").GetValue().GetString();///< Com2 is deprecated
  allSearchableStrings.push_back(&stringCom1);
  allSearchableStrings.push_back(&stringCom2);

  return allSearchableStrings;
}

vector<gd::String*> CommentEvent::GetAllSearchableStrings( BaseEvent &event) {
  vector<const gd::String*> allSearchableStrings;

  stringCom1 = event.GetChild("comment", 0, "Com1").GetValue().GetString();
  stringCom2 = event.GetChild("comment", 0, "Com2").GetValue().GetString();///< Com2 is deprecated
  allSearchableStrings.push_back(&stringCom1);
  allSearchableStrings.push_back(&stringCom2);

  return allSearchableStrings;
}

void CommentEvent::SerializeTo(SerializerElement &element) const {
  element.AddChild("color")
      .SetAttribute("r", r)
      .SetAttribute("g", v)
      .SetAttribute("b", b)
      .SetAttribute("textR", textR)
      .SetAttribute("textG", textG)
      .SetAttribute("textB", textB);

  element.AddChild("comment").SetValue(com1);
  element.AddChild("comment2").SetValue(com2);
}

void CommentEvent::UnserializeFrom(gd::Project &project,
                                   const SerializerElement &element) {
  const SerializerElement &colorElement =
      element.GetChild("color", 0, "Couleur");
  r = colorElement.GetIntAttribute("r");
  v = colorElement.GetIntAttribute("g", 0, "v");
  b = colorElement.GetIntAttribute("b");
  textR = colorElement.GetIntAttribute("textR");
  textG = colorElement.GetIntAttribute("textG");
  textB = colorElement.GetIntAttribute("textB");

  com1 = element.GetChild("comment", 0, "Com1").GetValue().GetString();
  com2 = element.GetChild("comment2", 0, "Com2").GetValue().GetString();
}

}  // namespace gd
