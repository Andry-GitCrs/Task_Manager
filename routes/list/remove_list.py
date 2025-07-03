from datetime import datetime
from flask import jsonify, request
from flask_login import login_required, current_user

def remove_list(app, database):
  db = database["db"]
  List = database['tables']['List']
  @app.route('/api/user/lists/remove', defaults={'list_id': None, 'perm': False}, methods=['DELETE'])
  @login_required
  def list_remove(list_id, perm):
    try:
      list_id = request.args.get('list_id')
      perm = request.args.get('perm')
      if not list_id:
        return jsonify({
          'error': "List id is required",
        }), 401
      
      list = List.query.filter_by(list_id = list_id, user_id = current_user.user_id).first()

      if not list:
        return jsonify({
          'error': 'List not found'
        }), 404
      
      if list.strict and list.stat:
        return jsonify({
          'error': f'"{list.list_name}" is an important list and cannot be deleted',
        }), 401
      
      if list.stat:
        if perm:
          db.session.delete(list)
          db.session.commit()
          return jsonify({
            'message': 'List has been deleted permanentely',
          }), 200
        
        list.stat = False
        list.updated_at = datetime.utcnow()
        db.session.commit()
        return jsonify({
          'message': 'List deleted successfully',
        }), 200
      
      list.stat = True
      list.updated_at = datetime.utcnow()
      db.session.commit()
      return jsonify({
        'message': 'List restored successfully',
      }), 200
    except Exception as e:
      return jsonify({
        'error': str(e),
      }), 500