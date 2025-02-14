import os

def print_directory_structure(path, level=0):
    try:
        for entry in os.listdir(path):
            full_path = os.path.join(path, entry)
            print('    ' * level + '|-- ' + entry)
            if os.path.isdir(full_path):
                print_directory_structure(full_path, level + 1)
    except PermissionError:
        print('    ' * level + '|-- [Permission Denied]')

# Set the path to your directory
directory_path = r'D:/Frontend'
print_directory_structure(directory_path)
