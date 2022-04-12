/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */

#include "GDCore/Events/Expression.h"

#include "GDCore/Events/Parsers/ExpressionParser2.h"
#include "GDCore/String.h"

namespace gd {

Expression::Expression() : node(nullptr){};

Expression::Expression(gd::String plainString_)
    : node(nullptr), plainString(plainString_){};

Expression::Expression(const char* plainString_)
    : node(nullptr), plainString(plainString_){};

Expression::Expression(const Expression& copy)
    : node(nullptr), plainString{copy.plainString} {};

Expression& Expression::operator=(const Expression& expression) {
  plainString = expression.plainString;
  node = nullptr;
  return *this;
};

Expression::~Expression(){};

std::unique_ptr<ExpressionNode> Expression::GetRootNode(
    const gd::String& type, gd::ExpressionParser2& parser) const {
  if (!node) {
    node = parser.ParseExpression(type, plainString);
  }
  return std::unique_ptr<ExpressionNode>(std::move(node));
}

}  // namespace gd
