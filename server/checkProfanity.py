import sys
from profanity_check import predict, predict_prob

def predictProfanity() :
    print(predict([sys.argv[1]]))
    print(predict([sys.argv[2]]))



if __name__ =='__main__' :
    predictProfanity = predictProfanity()

