from . import(
  get_user_list,
  add_list,
  remove_list,
  update_list
)

def use_list_route(app, database):
  routes = [
    get_user_list.get_user_list,
    add_list.add_list,
    remove_list.remove_list,
    update_list.update_list
  ]

  for route in routes:
    route(app, database)