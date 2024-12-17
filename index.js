const fs = require('fs')
const sfxDir = './frpg_sfxbnd_commoneffects-ffxbnd-dcx/sfx'
// const sfxDir = './ds_r/sfx'
const files = fs.readdirSync(`${sfxDir}/effect`)
const { buffer } = require('node:stream/consumers')
const fsPromises = require("fs").promises; 

const getBuffer = async({file}) => {
    const rs = fs.createReadStream(`${sfxDir}/effect/${file}`)
    const buf = await buffer(rs)
    const fileId = file.split('.')[0].substring(1)
    return {
        buf, fileId
    }
}

const bufferFunctions = (buf) => {
    return { 
        readAt: (offset, type) => {
            switch (type) {
                case 'short': // Read a 2 bit int
                    return buf.readInt16LE(offset)
                case 'long': // Read a 4 bit int    
                    return buf.readInt32LE(offset)
                case 'float': // Read a 4 bit float
                    return buf.readFloatLE(offset)
                case 'vector4': // Read a 4d vector
                    const vector = []
                    vector.push(buf.readUInt8(offset))
                    vector.push(buf.readUInt8(offset+1))
                    vector.push(buf.readUInt8(offset+2))
                    vector.push(buf.readUInt8(offset+3))
                    return vector
            }
        }
    }
}

const parseFXR = async({file}) => {
    const elementMap = {
        1: { desc: 'IntParameterType1', length: 16, data: (elementOffset) => {
            return {
                unk01: readAt(elementOffset + 8, 'long')
            }
        }},
        2: { desc: 'IntListParameter', length: 24, data: (elementOffset) => {
            const res = {
                offset: readAt(elementOffset + 8, 'long'),
                count: readAt(elementOffset + 16, 'long')
            }
            res.data = []
            for (let i=0; i<res.count;i++) {
                res.data.push(readAt(res.offset + (i*4), 'long'))
            }
        }},
        5: { desc: 'IntSequenceParameterType5', length: 32, data: (elementOffset) => {
            const res = {
                data01Offset: readAt(elementOffset + 8, 'long'),
                data02Offset: readAt(elementOffset + 16, 'long'),
                count: readAt(elementOffset + 24, 'long')
            }
            res.data01 = []
            res.data02 = []
            for (let i=0; i<res.count; i++) {
                res.data01.push(readAt(res.data01Offset+(i*4), 'float'))
                res.data02.push(readAt(res.data02Offset+(i*4), 'long'))
            }
            return res
        }},
        6: { desc: 'IntSequenceParameterType6', length: 32, data: (elementOffset) => { // Review this one
            const res = {
                data01Offset: readAt(elementOffset + 8, 'long'),
                data02Offset: readAt(elementOffset + 16, 'long'),
                count: readAt(elementOffset + 24, 'long')
            }
            res.data01 = []
            res.data02 = []
            for (let i=0; i<res.count; i++) {
                res.data01.push(readAt(res.data01Offset+(i*4), 'float'))
                res.data02.push(readAt(res.data02Offset+(i*4), 'long'))
            }
            return res
        }},
        7: { desc: 'FloatParameter', length: 16, data: (elementOffset) => {
            return {
                unk01: readAt(elementOffset + 8, 'long')
            }
        }},
        11: { desc: 'FloatSequenceParameterType11', length: 32, data: (elementOffset) => { // Maybe longer
            const res = {
                data01Offset: readAt(elementOffset + 8, 'long'),
                data02Offset: readAt(elementOffset + 16, 'long'),
                count: readAt(elementOffset + 24, 'long')
            }
            res.data01 = []
            res.data02 = []
            for (let i=0; i<res.count; i++) {
                res.data01.push(readAt(res.data01Offset+(i*4), 'float'))
                res.data02.push(readAt(res.data02Offset+(i*4), 'float'))
            }
            return res
        }},
        13: { desc: 'Float3SequenceParameterType13', length: 32, data: (elementOffset) => {
            const res = {
                data01Offset: readAt(elementOffset + 8, 'long'),
                data02Offset: readAt(elementOffset + 16, 'long'),
                count: readAt(elementOffset + 24, 'long')
            }
            res.data01 = []
            res.data02 = []
            for (let i=0; i<res.count; i++) {
                res.data01.push(readAt(res.data01Offset+(i*4), 'vector4'))
                res.data02.push(readAt(res.data02Offset+(i*4), 'vector4'))
            }
            return res
        }},
        19: { desc: 'ColorSequenceParameterType19', length: 32, data: (elementOffset) => {
            const res = {
                data01Offset: readAt(elementOffset + 8, 'long'),
                data02Offset: readAt(elementOffset + 16, 'long'),
                count: readAt(elementOffset + 24, 'long')
            }
            res.data01 = []
            res.data02 = []
            for (let i=0; i<res.count; i++) {
                res.data01.push(readAt(res.data01Offset+(i*4), 'float'))
                res.data02.push(readAt(res.data02Offset+(i*4), 'vector4')) // Vectors?
            }
            return res
        }},
        37: { desc: 'EFFECT_CALL', length: 32, data: (elementOffset) => {
            return {
                EffectID: readAt(elementOffset + 8, 'long'),
                ParamContainer: readAt(elementOffset + 16, 'long'),
                unk01: readAt(elementOffset + 24, 'long'),
            }
        }},
        38: { desc: 'ACTION_CALL', length: 32, data: (elementOffset) => {
            const res = {
                ActionID: readAt(elementOffset + 8, 'long'),
                ParamContainer: readAt(elementOffset + 16, 'long'),
                unk01: readAt(elementOffset + 24, 'long'),
            }
            if (res.offset01 !== 0) {
                // TODO 38a
            }
            return res
        }},
        40: { desc: 'ActionParamStructType40', length: 16, data: (elementOffset) => {
            return {
                'texid': readAt(elementOffset + 8, 'long'),
            }
        }},
        41: { desc: 'IntParameterType41', length: 16, data: (elementOffset) => {
            return {
                'texid': readAt(elementOffset + 8, 'long'),
            }
        }},
        44: { desc: 'IndexedIntParameter', length: 16, data: (elementOffset) => {
            return {
                unk01: readAt(elementOffset + 8, 'long'),
            }
        }},
        69: { desc: 'SoundIDParameterType69?', length: 16, data: (elementOffset) => {
            return {
                'texid': readAt(elementOffset + 8, 'long'),
            }
        }},
        70: { desc: 'TimeParameter', length: 16, data: (elementOffset) => {
            return {
                unk01: readAt(elementOffset + 8, 'float')
            }
        }},
        79: { desc: 'Int2Parameter', length: 16, data: (elementOffset) => {
            return {
                unk01: readAt(elementOffset + 8, 'long'),
            }
        }},
        81: { desc: 'Float2Parameter', length: 16, data: (elementOffset) => {
            return {
                unk01: readAt(elementOffset + 8, 'long')
            }
        }},
        82: { desc: 'Unknown', length: 24, data: (elementOffset) => {
            return {
                offset01: readAt(elementOffset + 8, 'long'),
                value01: readAt(elementOffset + 16, 'float')
            }
            // Todo follow offset
        }},
        83: { desc: 'Unknown', length: 48, data: (elementOffset) => {
            return {
                unk01: readAt(elementOffset + 8, 'long'),
                value01: readAt(elementOffset + 16, 'vector4'),
                value02: readAt(elementOffset + 20, 'vector4'),
                value03: readAt(elementOffset + 24, 'vector4'),
                value04: readAt(elementOffset + 28, 'vector4'),
                value05: readAt(elementOffset + 32, 'vector4'),
                value06: readAt(elementOffset + 36, 'vector4'),
                value07: readAt(elementOffset + 40, 'vector4'),
                value08: readAt(elementOffset + 44, 'vector4')
            }
        }},
        85: { desc: 'Time2Parameter', length: 16, data: (elementOffset) => {
            return {
                unk01: readAt(elementOffset + 8, 'vector4'),
                unk02: readAt(elementOffset + 12, 'vector4'),
            }
        }},
        111: { desc: 'IntParameterType111', length: 16, data: (elementOffset) => {
            // TODO
        }},
        112: { desc: 'UnknownConstParameterType112', length: 8, data: (elementOffset) => {
            // TODo
        }},
        122: { desc: 'DualParametersParameterType122', length: 24, data: (elementOffset) => {
            const res = {
                leftOffset: readAt(elementOffset + 8, 'long'),
                rightOffset: readAt(elementOffset + 16, 'long'),
            }
            res.leftElement = readElement(res.leftOffset) 
            res.rightElement = readElement(res.rightOffset) 
            return res
        }},
        126: { desc: 'DualParametersParameterType126', length: 24, data: (elementOffset) => {
            const res = {
                leftOffset: readAt(elementOffset + 8, 'long'),
                rightOffset: readAt(elementOffset + 16, 'long'),
            }
            res.leftElement = readElement(res.leftOffset) 
            res.rightElement = readElement(res.rightOffset) 
            return res
        }},
        127: { desc: 'DualParametersParameterType127', length: 24, data: (elementOffset) => {
            const res = {
                leftOffset: readAt(elementOffset + 8, 'long'),
                rightOffset: readAt(elementOffset + 16, 'long'),
            }
            res.leftElement = readElement(res.leftOffset) 
            res.rightElement = readElement(res.rightOffset) 
            return res
        }},
        128: { desc: 'ParameterParameterType128', length: 16, data: (elementOffset) => {
            const res = {
                operandOffset: readAt(elementOffset + 8, 'long')
            }
            res.operand = readElement(res.operandOffset)
            // res.child = readElement(res.operandOffset)
            return res
        }},
        // 130: { desc: 'Unknown', length: 120, data: (elementOffset) => {
        //     const res = {
        //         offet01: readAt(elementOffset + 8, 'long'),
        //         offet02: readAt(elementOffset + 16, 'long'),
        //         offet03: readAt(elementOffset + 24, 'long'),
        //         offet04: readAt(elementOffset + 32, 'long'),
        //         offet05: readAt(elementOffset + 40, 'long'),
        //         offet06: readAt(elementOffset + 48, 'long'),
        //         offet07: readAt(elementOffset + 56, 'long'),
        //         offet08: readAt(elementOffset + 64, 'long'),
        //         offet09: readAt(elementOffset + 72, 'long'),
        //         offet10: readAt(elementOffset + 80, 'long'),
        //         offet11: readAt(elementOffset + 88, 'long'),
        //         offet12: readAt(elementOffset + 96, 'long'),
        //         offet13: readAt(elementOffset + 104, 'long'),
        //         offet14: readAt(elementOffset + 112, 'long'),
        //     }
            
        //     return res
        // }},
        133: { desc: 'EFFECT_CONSTRUCTOR', length: 72, data: (elementOffset) => {
            const res = {
                sfxId: readAt(elementOffset + 8, 'long'),
                unk01: readAt(elementOffset + 16, 'long'),
                unk02: readAt(elementOffset + 24, 'long'),
                unk03: readAt(elementOffset + 32, 'long'),
                unk04: readAt(elementOffset + 40, 'long'),
                unk05: readAt(elementOffset + 48, 'long'),
                unk06: readAt(elementOffset + 52, 'long'),
                unk07: readAt(elementOffset + 56, 'long'),
                unk08: readAt(elementOffset + 64, 'long'),
                offset01: readAt(elementOffset + 72, 'long'),
                count01:readAt(elementOffset + 80, 'long'), // Think this is a type (1-7)
                offset02: readAt(elementOffset + 88, 'long'),
                children: []
            }
            if (res.offset01) {
                for (let i=0; i<res.count01; i++){
                    const elementOffset = readAt(res.offset01 + (i*8), 'long')
                    // console.log(elementOffset)
                    res.children.push(readElement(elementOffset))
                }
            } else {
                res.warning = 'Root element contains no children'
            }
            return res
        }},
        136: { desc: 'UnknownConstParameterType136', length: 8, data: (elementOffset) => {
            return {
                childOffset: readAt(elementOffset + 8, 'long') // Points to a 37
            }
        }},
        138: { desc: 'UnknownIntParameterType138', length: 16, data: (elementOffset) => {
            return {
                unk01: readAt(elementOffset + 8, 'long'),
            }
        }},
        141: { desc: 'Unknown', length: 48,  data: (elementOffset) => {
            return {
                unk01: readAt(elementOffset + 8, 'long'),
                offset01: readAt(elementOffset + 16, 'long'),
                count01: readAt(elementOffset + 24, 'long'), // is this a count
                count02: readAt(elementOffset + 28, 'long'), // is this a count
                unk05: readAt(elementOffset + 32, 'long'),
                unk06: readAt(elementOffset + 36, 'long'),
                unk07: readAt(elementOffset + 40, 'long'),
                unk08: readAt(elementOffset + 44, 'long'),
            }
        }},
        142: { desc: 'Unknown', length: 48,  data: (elementOffset) => {
            return {
                unk01: readAt(elementOffset + 8, 'long'),
                unk02: readAt(elementOffset + 16, 'long'),
                unk03: readAt(elementOffset + 24, 'long'),
                unk04: readAt(elementOffset + 28, 'long'),
                unk05: readAt(elementOffset + 32, 'long'),
                unk06: readAt(elementOffset + 36, 'long'),
                unk07: readAt(elementOffset + 40, 'long'),
                unk08: readAt(elementOffset + 44, 'long'),
            }
        }},
        143: { desc: 'Unknown', length: 48, data: (elementOffset) => {
            return {
                unk01: readAt(elementOffset + 8, 'long'),
                unk02: readAt(elementOffset + 16, 'long'),
                unk03: readAt(elementOffset + 24, 'long'),
                unk04: readAt(elementOffset + 28, 'long'),
                unk05: readAt(elementOffset + 32, 'long'),
                unk06: readAt(elementOffset + 36, 'long'),
                unk07: readAt(elementOffset + 40, 'long'),
                unk08: readAt(elementOffset + 44, 'long'),
            }
        }},
        146: { desc: 'Unknown', length: 48, data: (elementOffset) => {
            return {
                unk01: readAt(elementOffset + 8, 'long'),
                unk02: readAt(elementOffset + 16, 'long'),
                unk03: readAt(elementOffset + 24, 'long'),
                unk04: readAt(elementOffset + 28, 'long'),
                unk05: readAt(elementOffset + 32, 'long'),
                unk06: readAt(elementOffset + 36, 'long'),
                unk07: readAt(elementOffset + 40, 'long'),
                unk08: readAt(elementOffset + 44, 'long'),
            }
        }},
        147: { desc: 'Unknown', length: 48, data: (elementOffset) => {
            return {
                unk01: readAt(elementOffset + 8, 'long'),
                unk02: readAt(elementOffset + 16, 'long'),
                unk03: readAt(elementOffset + 24, 'long'),
                unk04: readAt(elementOffset + 28, 'long'),
                unk05: readAt(elementOffset + 32, 'long'),
                unk06: readAt(elementOffset + 36, 'long'),
                unk07: readAt(elementOffset + 40, 'long'),
                unk08: readAt(elementOffset + 44, 'long'),
            }
        }},
    }

    const readElement = (elementOffset) => {
        const elementType = readAt(elementOffset, 'long')
        const elementConfig = elementMap[elementType]
        if (!elementConfig) {
            if (!unmappedElements[elementType]) unmappedElements[elementType] = []
            unmappedElements[elementType].push(elementOffset)
        } else {
            if (!mappedElements[elementType]) mappedElements[elementType] = []
            mappedElements[elementType].push(elementOffset)
        }

        const res = {
            elementType,
            elementOffset,
            elementConfig,
            // elementLength: elementConfig?.length,
            // elementDescription: elementConfig?.desc,
            elementData: elementConfig?.data?.(elementOffset) || 'Unknown'
        }
        // if (elementType === 112) console.log(JSON.stringify(res, null, 2))
        return res
    }

    const fileStat = await fsPromises.stat(`${sfxDir}/effect/${file}`)
    const {buf, fileId} = await getBuffer({file})
    const { readAt } = bufferFunctions(buf)

    const unmappedElements = {}
    const mappedElements = {}

    const header = {
        'Version': readAt(6, 'short'),
        'SFX ID': readAt(56, 'long'),
        'Root Offset': readAt(8, 'long'),
        'Index Offset': readAt(16, 'long'),
        'Offset Count': readAt(20, 'long'),
        'Elements Count': readAt(24, 'long'),
        'proxyType': readAt(28, 'long'),
        'proxyOffset': readAt(32, 'long')
    }
    if (header.proxyType) {
        for (let i=0; i<header.count01; i++) {
            if (proxyType === 2) {
                header.proxyData = {
                    offset01: readAt(header.proxyOffset, 'long'),
                    offset02: readAt(header.proxyOffset + 8, 'long'),
                    unk01: readAt(header.proxyOffset + 16, 'long'),
                    unk02: readAt(header.proxyOffset + 20, 'long'),
                    offset03: readAt(header.proxyOffset + 32, 'long'),
                    unk03: readAt(header.proxyOffset + 36, 'long'),
                    unk04: readAt(header.proxyOffset + 40, 'long'),
                    unk05: readAt(header.proxyOffset + 44, 'long'),
                }
            } else header.proxyData = 'Unmapped' // Todo type 3,4,5,6,7
        }
    }

    const rootElementType = readAt(header['Root Offset'], 'long')
    let rootElement = { elementType: rootElementType }
    if (rootElementType === 133) { // TODO support 134
        rootElement.elementOffset = header['Root Offset']
        rootElement.elementData = elementMap[133].data(header['Root Offset'])
    }

    const allOffsets = []
    for (let i=0; i<header['Offset Count']; i++) {
        const offsetToOffset = readAt(header['Index Offset'] + (i*8), 'long')
        allOffsets.push(readAt(offsetToOffset, 'long'))
    }

    const allElements = {}
    const elements = []
    const elementList = []
    for (let i=0; i<header['Elements Count']; i++) {
        const elementOffset = readAt(header['Index Offset'] + (header['Offset Count'] * 8) + (i*8), 'long')
        const element = readElement(elementOffset)
        const { elementType, elementConfig } = element
        elementList.push(`${elementType} ${elementConfig?.desc}`)
        if (!allElements[elementType]) allElements[elementType] = 0
        allElements[elementType] ++
        elements.push(element)
        // console.log(element)
    }

    // console.log('Elements', JSON.stringify(elements, null, 2))
    // console.log('File', file)
    // console.log("Header", JSON.stringify(header, null, 2))
    // console.log('Root Element', JSON.stringify(rootElement, null, 2))
    // console.log("All Offsets", allOffsets)
    // console.log('Mapped Elements', mappedElements)
    // console.log('Unmapped Elements', unmappedElements)

    return {
        'Meta': {
            'File': file,
            'FileSize': `${(fileStat.size/1024).toFixed(0)}kb`,
            // 'Mapped Elements': mappedElements,
            // 'Unmapped Elements': unmappedElements,
            'Total Elements': header['Elements Count'],
            'Element List': elementList,
            'Element Count': allElements,
            'All Offsets': allOffsets,
        },
        'Header': header,
        'Root Element': rootElement,
        'Elements': elements,
        'Root Element': rootElement,
    }
}

const parseHex = async({file}) => {
    const {buf} = await getBuffer({file})
    const { readAt } = bufferFunctions(buf)

    const offsetList = []
    const elementList = []
    const indexOffset = readAt(16, 'long')
    const offsetCount = readAt(20, 'long')
    const elementCount = readAt(24, 'long')

    for (let i=0; i<offsetCount; i++) {
        const offsetToOffset = readAt(indexOffset + (i*8), 'long')
        offsetList.push(offsetToOffset)
    }

    for (let i=0; i<elementCount; i++) {
        const elementOffset = readAt(indexOffset + (offsetCount * 8) + (i*8), 'long')
        elementList.push(elementOffset)
    }

    const out = fs.createWriteStream(`./output/sfx/effect/${file}`)
    for (let i=0; i<buf.length; i+=4) {
        let note1 = []
        if(offsetList.includes(i)) note1.push('offset')
        if (elementList.includes(i)) note1.push('element')
        if (i === 0) note1.push('FXR')
        if (i === 4) note1.push('Version 2')
        if (i === 8) note1.push('Root Offset')
        if (i === 12) note1.push('Always 0')
        if (i === 16) note1.push('Offset to Offset List')
        if (i === 20) note1.push('Count of Offsets in Offset List')
        if (i === 24) note1.push('Count of Elements')
        if (i === 28) note1.push('Unknown (root element count?)')
        if (i === 32) note1.push('Offset to 142 Element')
        if (i === 48) note1.push('Root Element (133 or 134)')
        if (i === 56) note1.push('SFX ID')
        if (i >= indexOffset + (8*offsetCount)) note1.push('Element List')
        if (i >= indexOffset && i< indexOffset + (8*offsetCount)) note1.push('Offset List')

        const csv = [
            i, 
            buf.readInt32LE(i).toString(),
            note1 || ''
        ]
        out.write(`${csv.map(r => r.toString().padEnd(8)).join(' ')}\n`)
    }
    out.end()
}

// parseFXR({file: 'f000610250.fxr'})
// parseFXR({file: 'f190000000.fxr'}) // Blood hit?
// const file = 'f000002020.fxr'
const processOneFXR = async({file}) => {
    const outJson = await parseFXR({file})
    // console.log(JSON.stringify(outJson.Meta, null, 2))
    const out = fs.createWriteStream(`./output/sfx/effect/${file}.json`)
    out.write(JSON.stringify(outJson, null, 2))
    out.end()
}
// parseHex({file})
// processOneFXR({file})


const processAllFXR = async() => {
    const files = fs.readdirSync(`${sfxDir}/effect`)
    
    const log = {}
    const elementCount = {}
    for (const fxr of files) {
        try {
            await processOneFXR({file: fxr})
            // const outJson = await parseFXR({file: fxr})
            // for (const element of outJson.Elements) {
            //     const {elementType} = element
            //     if (!elementCount[elementType]) elementCount[elementType] = 0
            //     elementCount[elementType] ++
            // }

            // Find type of count01 on root element
            // if (!log[outJson['Root Element']?.elementData?.count01]) {
            //     log[outJson['Root Element']?.elementData?.count01] = []
            // }
            // log[outJson['Root Element']?.elementData?.count01].push(fxr)

            // Find element 130s
            // outJson['Elements'].forEach(element => {
            //     if (element.elementType === 130) console.log(fxr)
            // })

        } catch(e) {
            e.message = `Failed to parse: ${fxr}. ${e.message}`
            throw e
        }
    }
    // console.log(elementCount)
    // const {buf, fileId} = await getBuffer({file})


}
processAllFXR()
