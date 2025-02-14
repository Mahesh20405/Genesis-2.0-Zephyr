import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, Dropout, Activation, Flatten
from tensorflow.keras.layers import Conv2D, MaxPooling2D
from tensorflow.keras.callbacks import TensorBoard
from sklearn.model_selection import train_test_split
import pickle
import time

# Constants
HEIGHT = 28
WIDTH = 28
class_num = 47

train_x = pickle.load(open("D3.pickle", "rb"))
train_y = pickle.load(open("D4.pickle", "rb"))

test_x = pickle.load(open("D1.pickle", "rb"))
test_y = pickle.load(open("D2.pickle", "rb"))

print(test_x.shape)

# train and val split
train_x, val_x, train_y, val_y = train_test_split(
    train_x, train_y, test_size=0.10, random_state=7)

# 1st run: create the following permutations of models
dense_layers = [0, 1, 2]
layer_sizes = [32, 64, 128]
conv_layers = [1, 2, 3]

for dense_layer in dense_layers:
    for layer_size in layer_sizes:
        for conv_layer in conv_layers:

            NAME = "{}-conv-{}-nodes-{}-dense-{}".format(
                conv_layer, layer_size, dense_layer, int(time.time()))
            
            tensorboard = TensorBoard(log_dir='logs/{}'.format(NAME))
            print(NAME)

            model = Sequential()

            model.add(Conv2D(layer_size, (3, 3), input_shape=(HEIGHT, WIDTH, 1)))
            model.add(Activation('relu'))
            model.add(MaxPooling2D(pool_size=(2, 2)))

            for l in range(conv_layer - 1):
                model.add(Conv2D(layer_size, (3, 3)))
                model.add(Activation('relu'))
                model.add(MaxPooling2D(pool_size=(2, 2)))

            model.add(Flatten())

            for l in range(dense_layer):
                model.add(Dense(layer_size))
                model.add(Activation('relu'))

            model.add(Dense(units=class_num, activation='softmax'))

            model.compile(optimizer='adam',
                        loss='categorical_crossentropy',
                        metrics=['accuracy'])

            model.fit(train_x, train_y, epochs=10, batch_size=32,
                    validation_data=(val_x, val_y),
                    callbacks=[tensorboard])