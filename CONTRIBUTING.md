# Jore-map-ui conventions

## Git conventions

-   When making a PR, write closes #{_issue_id(s)_} or resolves #{_issue_id(s)_}
-   Branch name: {_issue_number_}-{_describing_name_}

**Git columns**

-   Backlog _- tasks that are blocked or need planning_
-   To do _- tasks that aren't blocked. These tasks should be in priority order._
-   Sprint _- tasks to do in the current sprint_
-   In progress _- tasks that are in progress or need review fixes_
-   Done sprint _- completed tasks in the current sprint_
-   Done _- completed tasks from previous sprints_

## Code conventions

-   Indent 4 whitespaces
-   Use async await instead of promises

### Typescript

-   Use Date type if property's type is date

### React

-   Use `<div>` instead of `<span>` (only use span if there is a reason to use it)
-   In a component, first div's className should be {_componentName_}View
-   Use classnames if there are multiple classes
-   Use arrow functions in components
-   Use render prefix in methods that return JSX or HTML
-   Use export default at the end of file
-   Put lifecycle methods on top of components after constructor

### IModels

-   **IDs** are in the same format as in jore.

### MobX

-   Use @inject when importing stores whenever possible.

**Annotations**

-   Use decorators
-   Place decorators above functions
-   Use @computed for getters https://mobx.js.org/refguide/computed-decorator.html
-   Use @action for functions that modify state ( do not use setters) https://mobx.js.org/refguide/action.html

Variables order:

```
set foo1
get foo1
set foo2
get foo2

actions
...
```
