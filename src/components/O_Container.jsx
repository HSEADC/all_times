import React from 'react'
import A_Title from './A_Title.jsx'
import M_Card from './M_Card.jsx'

const workshops = [
  {
    date: '15 апреля 2025',
    title: 'Основы React, группа Б23ДЗ09'
  },
  {
    date: '15 апреля 2025',
    title: 'Основы React, группа Б23ДЗ08'
  },
  {
    date: '17 апреля 2025',
    title: 'Основы React, группа БП23ДЗ07'
  }
]

export default class O_Container extends React.Component {
  render() {
    const cards = workshops.map((workshop, i) => {
      return <M_Card key={i} name={workshop.title} date={workshop.date} />
    })

    return (
      <div className="O_Container">
        <A_Title name="Расписание" />
        {cards}
      </div>
    )
  }
}