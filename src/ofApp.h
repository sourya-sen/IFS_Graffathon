#pragma once

#include "ofMain.h"
#include "ofxMaxim.h"

class ofApp : public ofBaseApp{

	public:
		void setup();
		void update();
		void draw();

		void keyPressed(int key);
		void keyReleased(int key);
		void mouseMoved(int x, int y );
		void mouseDragged(int x, int y, int button);
		void mousePressed(int x, int y, int button);
		void mouseReleased(int x, int y, int button);
		void mouseEntered(int x, int y);
		void mouseExited(int x, int y);
		void windowResized(int w, int h);
		void dragEvent(ofDragInfo dragInfo);
		void gotMessage(ofMessage msg);
    
    //...sourya
    
    void audioOut(float * output, int bufferSize, int nChannels);
    int bufferSize, sampleRate;
    
    maxiOsc oscillator, modulator;
    maxiOsc lfo;
    maxiClock clock;
    int ticks;
    
    unsigned long playCount;
    bool play2, play4, play8;
    
    maxiEnv env;
    maxiFilter filter;
    maxiDelayline del;
    int trigger;
    
    maxiEnv env2;
    maxiOsc qOsc;
    int trigger2;
    float vol2;
    
    maxiFilter outFil;
    
    float frequency, ratio, index;
    unsigned long counter;
    
    float volume;
    
    
    vector<float> drawBuffer;
    vector<float> sawSynth;
    vector<float> delSynth;
    
    float rms;
    float sawRms;
    float delRms;
    
    vector<float> frequencyTable = {261.63, 293.66, 328.63, 349.23, 392.00, 440.00, 493.88, 523.25};
    
     vector<float> masterTable = {261.63, 293.66, 328.63, 349.23, 392.00, 440.00, 493.88, 523.25};
    
    int scene;
    float masterFader;
    
    //...sourya
    
    ofTrueTypeFont creditsFont, creditsFontSmall, creditsFontLarge;
    string creditLine1, creditLine2, creditLine3, creditLine4;
    
    int creditsTimer;
    bool hasChanged;
    
    ofShader shader;
    
    ofEasyCam camera;


};
