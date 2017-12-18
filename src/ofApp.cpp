#include "ofApp.h"

//--------------------------------------------------------------
void ofApp::setup(){
    
    
    //.........sourya
    sampleRate = 44100;
    bufferSize = 512;
    
    drawBuffer.resize(bufferSize);
    sawSynth.resize(bufferSize);
    delSynth.resize(bufferSize);
    
    maxiSettings::setup(sampleRate, 2, bufferSize);
    
    clock.setTempo(140);
    clock.setTicksPerBeat(1);
    
    env.setAttack(1000);
    env.setDecay(10);
    env.setSustain(10);
    env.setRelease(1000);
    
    env2.setAttack(100);
    env2.setDecay(10);
    env2.setSustain(10);
    env2.setRelease(1000);
    
    frequency = 440;
    ratio = 10;
    index = 100;
    
    masterFader = 1.0;
    
    ofSoundStreamSetup(2, 2, this, sampleRate, bufferSize, 4);
    //........sourya
    
    
    /*
    //LOAD YOUR OWN FONTS AND UNCOMMENT
     
    creditsFont.load("Neutra2Display-Titling.otf", 48);
    creditsFontLarge.load("Neutra2Display-Bold.otf", 125);
    creditsFontSmall.load("Neutra2Display-Bold.otf",24);
    creditLine1 = "B^2.S PRESENTED...";
    creditLine2 = "IF'S";
    creditLine3 = "GREETINGS GO TO...";
    creditLine4 = "SORRY. IF ONLY WE KNEW ANYONE. :/";
    
     */
    
    hasChanged = false;
    
    //ofToggleFullscreen();
    
#ifdef TARGET_OPENGLES
    shader.load("shadersES2/shader");
#else
    if(ofIsGLProgrammableRenderer()){
        shader.load("shadersGL3/shader");
    }else{
        shader.load("shadersGL2/shader");
    }
#endif
    
    //note: the other versions of the shader doesn't exist, so if running on openGL2 or openGLES, please be aware!

}

//--------------------------------------------------------------
void ofApp::update(){
    
    ofSetWindowTitle(ofToString(ofGetFrameRate()));
    
    
    //........sourya
    double sumSquare = 0;
    
    for(int i=0; i<drawBuffer.size(); i++){
        sumSquare += pow(drawBuffer[i], 2);
    }
    
    sumSquare = sumSquare/drawBuffer.size();
    
    rms = sqrt(sumSquare);
    
    //.
    
    double sumSawSquare = 0;
    
    for(int i=0; i<sawSynth.size(); i++){
        sumSawSquare += pow(sawSynth[i], 2);
    }
    
    sumSawSquare = sumSawSquare/sawSynth.size();
    
    sawRms = sqrt(sumSawSquare);
    
    //.
    
    double sumDelSquare = 0;
    
    for(int i=0; i<delSynth.size(); i++){
        sumDelSquare += pow(delSynth[i], 2);
    }
    
    sumDelSquare = sumDelSquare/delSynth.size();
    
    delRms = sqrt(sumDelSquare);
    
    //.
    
    if(scene==0){
        frequencyTable = {261.63, 523.25};
        
    } else if (scene==1){
        frequencyTable = {261.63, 328.63, 392.00};
        
    } else if (scene==2){
        frequencyTable = {261.63, 293.66, 328.63, 349.23, 392.00, 440.00, 493.88, 523.25};
        
    }else if (scene==3){
        frequencyTable = {261.63, 392.00, 523.25};
        
    }else if (scene==4){
        frequencyTable = {328.63, 392.00};
        
    }else if (scene==5){
        frequencyTable = {261.63, 293.66, 328.63, 349.23, 392.00, 440.00, 493.88, 523.25};
        
    }
    //..............sourya
    
}

//--------------------------------------------------------------
void ofApp::draw(){
    
    if (scene > 6) {
        ofExit();
    }
    
    ofSetColor(255);
    
    camera.begin();
    
    ofVec3f xAxis = camera.getXAxis();
    ofVec3f yAxis = camera.getYAxis();
    ofVec3f zAxis = camera.getZAxis();
    
    camera.end();
    
    ofSetWindowTitle("if's by B^2.S running at " + ofToString(ofGetFrameRate()));
    
    shader.begin();
    
    shader.setUniform1f("time", ofGetElapsedTimef());
    shader.setUniform3f("xAxis", xAxis.x, xAxis.y, xAxis.z);
    shader.setUniform3f("yAxis", yAxis.x, yAxis.y, yAxis.z);
    shader.setUniform3f("zAxis", zAxis.x, zAxis.y, zAxis.z);
    shader.setUniform1f("musicMaster", rms);
    shader.setUniform1f("musicA", sawRms);
    shader.setUniform1f("musicB", delRms);
    shader.setUniform1i("scene", scene);
    shader.setUniform1i("masterClock", playCount);
    shader.setUniform1f("windowWidth", float(ofGetWidth()));
    shader.setUniform1f("windowHeight", float(ofGetHeight()));
   
    ofDrawRectangle(0, 0, ofGetWidth(), ofGetHeight());
    
    shader.end();
    
    /* 
    //UNCOMMENT IF FONTS ARE LOADED
    
    if(scene==6){
        
        if (!hasChanged){
        creditsTimer = playCount;
            hasChanged = true;
        }
        ofSetColor(45, 20, 25, 160);
        creditsFont.drawString(creditLine1, ofGetWidth()/2, ofGetHeight()/3);
        
        if(playCount - creditsTimer> 10){
            creditsFontLarge.drawString(creditLine2, ofGetWidth()/2, ofGetHeight()/3+130);
        }
        
        if(playCount - creditsTimer> 30){
            creditsFont.drawString(creditLine3, ofGetWidth()/2, ofGetHeight()/3+185);
        }
        if(playCount - creditsTimer> 38){
            creditsFontSmall.drawString(creditLine4, ofGetWidth()/2, ofGetHeight()/3+218);
        }
        
    
    }
     */
    
}


//--------------------------------------------------------------
void ofApp::audioOut(float * output, int bufferSize, int nChannels){
    
    for(int i = 0; i<bufferSize; i++){
        clock.ticker();
        
        double qFreq;
        
        if (clock.tick){
            
            playCount ++;
            
            
            playCount%2==0? play2=true:play2=false;
            playCount%4==0? play4=true:play4=false;
            playCount%8==0? play8=true:play8=false;
            
            ticks = int(ofRandom(1, 4));
            frequency = frequencyTable[ofRandom(frequencyTable.size())];
            
            if((scene == 0) || (scene == 4)){
                qFreq = frequencyTable[ofRandom(frequencyTable.size())];
            } else {
                qFreq = masterTable[ofRandom(masterTable.size())];
            }
            
            
            clock.setTicksPerBeat(ticks);
            
            if(playCount%64 == 0){
                scene++;
            }
            
            if(scene == 6){
                masterFader *= 0.95;
                masterFader -= 0.005;
            }
            masterFader = ofClamp(masterFader, 0, 1);
        }
        
        counter ++;
        
        trigger = play4;
        
        if((scene == 0) || (scene==2)){
            trigger2 = play8;
        } else {
            trigger2 = play2;
        }
        
        volume = env.adsr(1.0, trigger);
        vol2 = env2.adsr(1.0, trigger2);
        
        double qOscOut = outFil.hires(qOsc.sinebuf4(qFreq/float(2)), 1200, 100) * vol2 * .2;
        
        double synthOut = oscillator.sawn(frequency + (modulator.sawn(ratio*frequency/float(2))*index)) * volume * .25;
        
        double filterOut = filter.lores(synthOut, 1000, 3000 * fabs(lfo.sinewave(10)));
        
        double delOut = del.dl(filterOut + qOscOut/float(4), 10000, .9) * .5;
        
        double myOutput = (synthOut/float(12) + delOut/float(6) + qOscOut) * masterFader;
        
        output[i * nChannels] = myOutput;
        output[i * nChannels + 1] = myOutput;
        
        drawBuffer[counter%bufferSize] = myOutput;
        sawSynth[counter%bufferSize] = synthOut/float(12);
        delSynth[counter%bufferSize] = delOut/float(6) + qOscOut;
        
        trigger = 0;
        trigger2 = 0;
    }
}


//--------------------------------------------------------------
void ofApp::keyPressed(int key){
    
}

//--------------------------------------------------------------
void ofApp::keyReleased(int key){
    
}

//--------------------------------------------------------------
void ofApp::mouseMoved(int x, int y ){
    
}

//--------------------------------------------------------------
void ofApp::mouseDragged(int x, int y, int button){
    
}

//--------------------------------------------------------------
void ofApp::mousePressed(int x, int y, int button){
    
}

//--------------------------------------------------------------
void ofApp::mouseReleased(int x, int y, int button){
    
}

//--------------------------------------------------------------
void ofApp::mouseEntered(int x, int y){
    
}

//--------------------------------------------------------------
void ofApp::mouseExited(int x, int y){
    
}

//--------------------------------------------------------------
void ofApp::windowResized(int w, int h){
    
}

//--------------------------------------------------------------
void ofApp::gotMessage(ofMessage msg){
    
}

//--------------------------------------------------------------
void ofApp::dragEvent(ofDragInfo dragInfo){ 
    
}
