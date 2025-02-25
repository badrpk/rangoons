def define(entity, **attributes):
    return {'entity': entity, 'attributes': attributes}
def execute(command, **params):
    print(f'Executing {command} with {params}')
if __name__ == '__main__':
    user = define('User', name='text', age='number')
    execute('CreateUser', name='John', age=30)
