const itemLoaders = {
    travel: {
        dali: () =>
            import('./items/travel/dali')
    },
    film: {
        '2026-xinjiang': () =>
            import('./items/film/2026-xinjiang.js'),
        'Roll1': () =>
            import('./items/film/roll1.js'),
        'Roll2': () =>
            import('./items/film/roll2.js')
    },
    daily: {
        '2021-9-23': () =>
            import('./items/daily/2021-9-23'),
        '2021-9-28': () =>
            import('./items/daily/2021-9-28'),
        '2021-10-2': () =>
            import('./items/daily/2021-10-2'),
        '2021-10-4': () =>
            import('./items/daily/2021-10-4'),
        '2021-10-16': () =>
            import('./items/daily/2021-10-16'),
        '2021-10-22': () =>
            import('./items/daily/2021-10-22'),
        '2022-12-31': () =>
            import('./items/daily/2022-12-31')
    }
}

export const itemCategoryMap = {
    dali: 'travel',
    'Roll1': 'film',
    'Roll2': 'film',
    '2021-9-23': 'daily',
    '2021-9-28': 'daily',
    '2021-10-2': 'daily',
    '2021-10-4': 'daily',
    '2021-10-16': 'daily',
    '2021-10-22': 'daily',
    '2022-12-31': 'daily',
    '2026-xinjiang': 'film',
}

export async function loadItemData(itemId) {
    const category = itemCategoryMap[itemId]
    if (!category || !itemLoaders[category]?.[itemId]) {
        return null
    }

    const module = await itemLoaders[category][itemId]()
    return {
        ...module.metadata,
        images: module.images
    }
}