# bbfxrtoxml
A start on converting BloodBorne FXR to XML
S0 here we go. First off, I have to say that none of this would have happened without the genius that is Stones! He came to me a said, "hey, I bet we can figure out how to convert the BB FXR sfx files to XML." I said, sure, I'm game. Little did I know it would take up hours of our times. Stones is one who actually coded this, I mainly stared at the FXR files in a hex editor for days on end deciphering what offset did what and where it went to. Stoney was the person who did the actual coding. Unfortunately, as real life often does, it came crashing in and we decided to release what we have since Stones has to take care of real life stuff and we wish him the best, and, well, I can't code!

First off let me say I don't code and I've never made a Github Repo before so if it's wrong, let me know and I apologize.

You can find the information inside the index.js file, but I will sum it up here also. To use this program, go into the folder wherever the unpacked frpg_sfxbnd_commoneffects-ffxbnd-dcx folder is and then create the output folder in the same folder which is output/sfx/effect and then use the javascriptnode download to run "node index.js" (or whatever you use to run javascript) and it will create and entire folder in output/sfx/effect with files of all the FXRs that look like this inside (only peices to keep it from spamming 10000 lines) If you need a primer on what an FXR file is like inside, check here: http://soulsmodding.wikidot.com/tutorial:ffx-files-for-sfx-explained

{
  "Meta": {
    "File": "f100021005.fxr",
    "FileSize": "7kb",
    "Total Elements": 149,
    "Element List": [
      "133 EFFECT_CONSTRUCTOR",
      "136 UnknownConstParameterType136",
      "38 ACTION_CALL",
      "1 IntParameterType1",
      "1 IntParameterType1",
      "1 IntParameterType1",
      "1 IntParameterType1",
      "1 IntParameterType1",
      ....
      The above info lists the total number of elements in the file and the order in which they appear, plus what we think the elements are.

       ],
    "Element Count": {
      "1": 131,
      "7": 5,
      "37": 1,
      "38": 3,
      "133": 1,
      "136": 1,
      "141": 1,
      "142": 1,
      "143": 1,
      "146": 2,
      "147": 2
    },
.........
The above lists how many of each element appear in the FXR file.

"All Offsets": [
      48,
      392,
      240,
      4152,
      416,
      880,
      1408,
      288,
      304,
      344,
      264,
      384,
      1480,
      1552,
      ......
      The above lists all the hex offsets (in decimal) in the FXR file where something actually is, be it an element, a referrer, or something else.

       "Header": {
    "Version": 2,
    "SFX ID": 100021005,
    "Root Offset": 48,
    "Index Offset": 4208,
    "Offset Count": 169,
    "Elements Count": 149,
    "proxyType": 1,
    "proxyOffset": 4144
  },
................
The above is the header information produced in all FXR files when this tool converts.

"Root Element": {
    "elementType": 133,
    "elementOffset": 48,
    "elementData": {
      "sfxId": 100021005,
      "unk01": 0,
      "unk02": 0,
      "unk03": 96,
      "unk04": 392,
      "unk05": 3,
      "unk06": 3,
      "unk07": 0,
      "unk08": 0,
      "offset01": 240,
      "count01": 2,
      "offset02": 4152,
      "children": [
        {
          "elementType": 264,
          "elementOffset": 288,
          "elementData": "Unknown"
        },
        {
          "elementType": 79,
          "elementOffset": 304,
          "elementConfig": {
            "desc": "Int2Parameter",
            "length": 16
          },
          "elementData": {
            "unk01": 1480
          }
        }
      ]
     }
  },
  ...................
  The above is the Effect Constructor start and it's root element information


  
  "Elements": [
    {
      "elementType": 133,
      "elementOffset": 48,
      "elementConfig": {
        "desc": "EFFECT_CONSTRUCTOR",
        "length": 72
      },
      "elementData": {
        "sfxId": 100021005,
        "unk01": 0,
        "unk02": 0,
        "unk03": 96,
        "unk04": 392,
        "unk05": 3,
        "unk06": 3,
        "unk07": 0,
        "unk08": 0,
        "offset01": 240,
        "count01": 2,
        "offset02": 4152,
        "children": [
          {
            "elementType": 264,
            "elementOffset": 288,
            "elementData": "Unknown"
          },
          {
            "elementType": 79,
            "elementOffset": 304,
            "elementConfig": {
              "desc": "Int2Parameter",
              "length": 16
            },
            "elementData": {
              "unk01": 1480
            }
          }
        ]
      }
    },
.............
The above is the bulk of the rest of the file, which is the actual structure of the FXR file as best as we could decode it. Here is the information on the offsets used just so you don't have to go digging into the .js file (all offsets in decimal):

0 just says its a FXR file

4 says is V2 (BB)

8 is an offset to the root element

12 is nothing (always 0)

16 is an offset to a list of all the offsets contained in the file

20 is a count of how many offsets are in the file

24 is a count of how many elements are in the file (edited)


All FXR files seem to have the elements in the same order, 133 and 134 are root effect constructors, and it looks like the elements are similar or the same to the ones in Dark Souls 1 (if you check the tool at https://github.com/JeNoVaViRuS/FXMLR_upload/releases/tag/FXMLR for DS1, we pretty sure the template for those elements are damn close if not the same as the ones used in BB). Basically you have an effect consutructor and then a root action call or effects call. Under that you can have sub action calls or effects calls, but there has to be the same number of calls under certaion headers thats why many elements seem to do nothing. If you are wondering how to tell if an action or effects call is a sub or main header, I believe it has to do with the UNK01 variable. If its "1" I believe it is a sub header action or effects call. WHo knows, though, I could be wrong. As you will see, the order in the FXR files are the same that means if you come across an action (element 38 for example) or effects call (element 37 for example) then the elements after that with UNK01=1 are probably sub headers. The next action or effects call with unk0=0 is probably the next main header and not a child. Hopefully this helps!




