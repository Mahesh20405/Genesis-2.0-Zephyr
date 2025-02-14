import matplotlib.pyplot as plt
import numpy as np
import os
import pandas as pd
import tensorflow as tf
import pickle
from tensorflow.keras import utils


train = pd.read_csv(os.path.join('D:/CMMF/Preprocessing_Phase/emnist-balanced-train.csv'), header=None)
train.head(10)

mapp_df = pd.read_csv("D:/CMMF/Preprocessing_Phase/emnist-balanced-mapping.txt", delimiter=' ', header=None, usecols=[1])

mapp = mapp_df.squeeze()

print(mapp.head(12))

index = 46
if index < len(mapp):
    print("char code of index {} is".format(index), mapp[index])
    print(chr(mapp[index]))
else:
    print(f"Index {index} is out of range for map Series.")

class_mapping = []
for num in range(len(mapp)):
    class_mapping.append(chr(mapp[num]))

print("Length of class_mapping:", len(class_mapping))

index = 45
if index < len(class_mapping):
    print("Class mapping at index 45:", class_mapping[index])
else:
    print(f"Index {index} is out of range for class_mapping list.")

print(train.shape, mapp.shape)

class_num = len(class_mapping)
print("Number of classes:", class_num)

HEIGHT = 28
WIDTH = 28

test_row_num = 631
test_row_num_img = train.values[test_row_num, 1:]
reshape_img = test_row_num_img.reshape(HEIGHT, WIDTH)
test_char = class_mapping[train.values[test_row_num, 0]]

plt.imshow(reshape_img, cmap=plt.cm.binary)
plt.title("This image is: {}".format(test_char))
plt.show()

img_flip = np.transpose(reshape_img, axes=[1, 0])
plt.imshow(img_flip, cmap=plt.cm.binary)
plt.title("This image is: {}".format(test_char))
plt.show()

def convert_training_data(df, row):
    pxl_data = df.values[row, 1:]
    pxl_reshape = pxl_data.reshape(HEIGHT, WIDTH)
    final_img = np.transpose(pxl_reshape, axes=[1, 0])
    return final_img

def get_char(df, row):
    return class_mapping[df.values[row, 0]]

# Test out the function
test_row = 32
test_row_img_data = convert_training_data(train, test_row)
test_char = get_char(train, test_row)

plt.imshow(test_row_img_data, cmap=plt.cm.binary)
plt.title("This image is: {}".format(test_char))
plt.show()

test = pd.read_csv(os.path.join('D:/CMMF/Preprocessing_Phase/emnist-balanced-test.csv'), header=None)  # Example file name

train_x = []
test_x = []

for i in range(len(train)):
    train_x.append(convert_training_data(train, i))

for i in range(len(test)):
    test_x.append(convert_training_data(test, i))

train_x = np.asarray(train_x)
test_x = np.asarray(test_x)

# Normalize the data
train_x = train_x.astype('float32')
train_x /= 255
test_x = test_x.astype('float32')
test_x /= 255

print(train_x.shape)
print(test_x.shape)

train_y = train.iloc[:, 0]
test_y = test.iloc[:, 0]

print("train_y: ", train_y.shape)
print("test_y: ", test_y.shape)

plt_cols = 4
plt_rows = 4
row_to_start = 100

fig = plt.figure(figsize=(8, 8))

for i in range(row_to_start, row_to_start + plt_cols * plt_rows):
    fig.add_subplot(plt_rows, plt_cols, i - row_to_start + 1)
    fig.tight_layout()
    plt.imshow(train_x[i], cmap=plt.get_cmap('gray'))
    plt.title(class_mapping[train_y[i]])
plt.show()

plt_cols = 4
plt_rows = 4
row_to_start = 100

fig = plt.figure(figsize=(8, 8))

for i in range(row_to_start, row_to_start + plt_cols * plt_rows):
    fig.add_subplot(plt_rows, plt_cols, i - row_to_start + 1)
    fig.tight_layout()
    plt.imshow(test_x[i], cmap=plt.get_cmap('gray'))
    plt.title(class_mapping[test_y[i]])
plt.show()

train_y_1D = train_y
test_y_1D = test_y

train_y = utils.to_categorical(train_y, class_num)
test_y = utils.to_categorical(test_y, class_num)

print("train_y: ", train_y.shape)
print("test_y: ", test_y.shape)

train_x = train_x.reshape(-1, HEIGHT, WIDTH, 1)
test_x = test_x.reshape(-1, HEIGHT, WIDTH, 1)

print(train_x.shape)
print(test_x.shape)

# Save data to pickle files
pickle_out = open("train_x.pickle", "wb")
pickle.dump(train_x, pickle_out)
pickle_out.close()

pickle_out = open("test_x.pickle", "wb")
pickle.dump(test_x, pickle_out)
pickle_out.close()

pickle_out = open("train_y.pickle", "wb")
pickle.dump(train_y, pickle_out)
pickle_out.close()

pickle_out = open("test_y.pickle", "wb")
pickle.dump(test_y, pickle_out)
pickle_out.close()
