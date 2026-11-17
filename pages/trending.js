import Link from 'next/link';
import { useMemo, useState } from 'react';

import Layout from '../components/Layout';
import { ChartRow, Movement, Podium } from '../components/Charts';
import Cover from '../components/Cover';
import { FlameIcon, SparkleIcon, TrendUpIcon } from '../components/Icons';
import Product from '../models/Product';
import db from '../utils/db';
import { chart, climbers, formatCompact, isComingSoon, weekLabel } from '../utils/catalog';
import Styles from '../styles/Trending.module.scss';

export default function Trending({ products }) {
	const categories = useMemo(
		() => ['All', ...new Set(products.filter((p) => !isComingSoon(p)).map((p) => p.category))],
		[products]
	);
	const [genre, setGenre] = useState('All');

	const top = useMemo(() => chart(products, { category: genre, limit: 10 }), [products, genre]);
	const overall = useMemo(() => chart(products, { limit: products.length }), [products]);
	const risers = useMemo(() => climbers(products, 3), [products]);
	const newEntries = overall.filter((b) => b.move === null).slice(0, 4);

	const max = top[0]?.weeklySales || 0;
	const totalReaders = overall.reduce((a, b) => a + (b.weeklySales || 0), 0);

	return (
		<Layout title="Trending">
			<section className={`page-hero ${Styles.hero}`}>
				<span className={Styles.flames} aria-hidden="true" />
				<div className="container">
					<p className="eyebrow">The weekly chart · {weekLabel()}</p>
					<h1>
						Trending <em>now</em>
					</h1>
					<p>The books our readers can&apos;t put down, ranked by how many people picked them up this week.</p>

					{totalReaders > 0 && (
						<ul className={Styles.stats}>
							<li>
								<strong>{formatCompact(totalReaders)}</strong>
								<span>Readers this week</span>
							</li>
							<li>
								<strong>{newEntries.length}</strong>
								<span>New entries</span>
							</li>
							{risers[0] && (
								<li>
									<strong>+{risers[0].growth}%</strong>
									<span>Biggest climber</span>
								</li>
							)}
						</ul>
					)}
				</div>
			</section>

			<div className="container">
				<div className={Styles.tabs} role="tablist" aria-label="Chart genre">
					{categories.map((c) => (
						<button
							key={c}
							role="tab"
							aria-selected={genre === c}
							className={`${Styles.tab} ${genre === c ? Styles.tabActive : ''}`}
							onClick={() => setGenre(c)}
						>
							{c === 'All' ? 'Overall Top 10' : c}
						</button>
					))}
				</div>

				{top.length === 0 ? (
					<p className={Styles.empty}>No chart data yet.</p>
				) : (
					<div key={genre}>
						<Podium books={top} />

						<ol className={Styles.chart} start={4}>
							{top.slice(top.length >= 3 ? 3 : 0).map((book, i) => (
								<ChartRow key={book.slug} book={book} max={max} index={i} />
							))}
						</ol>
					</div>
				)}

				<div className={Styles.extras}>
					{risers.length > 0 && (
						<section className={`${Styles.panel} reveal`}>
							<h2>
								<TrendUpIcon size={22} /> Biggest climbers
							</h2>
							<p className={Styles.panelSub}>Fastest-growing books compared with last week.</p>
							<ul className={Styles.climbers}>
								{risers.map((b) => (
									<li key={b.slug}>
										<Link href={`/books/${b.slug}`}>
											<a className={Styles.climber} data-sound="tap">
												<span className={Styles.climberCover}>
													<Cover src={b.image} title={b.name} author={b.author} />
												</span>
												<span className={Styles.climberInfo}>
													<strong>{b.name}</strong>
													<span>{b.author}</span>
												</span>
												<span className={Styles.growth}>+{b.growth}%</span>
											</a>
										</Link>
									</li>
								))}
							</ul>
						</section>
					)}

					{newEntries.length > 0 && (
						<section className={`${Styles.panel} reveal`}>
							<h2>
								<SparkleIcon size={20} /> New entries
							</h2>
							<p className={Styles.panelSub}>Books that weren&apos;t in last week&apos;s chart at all.</p>
							<ul className={Styles.climbers}>
								{newEntries.map((b) => (
									<li key={b.slug}>
										<Link href={`/books/${b.slug}`}>
											<a className={Styles.climber} data-sound="tap">
												<span className={Styles.climberCover}>
													<Cover src={b.image} title={b.name} author={b.author} />
												</span>
												<span className={Styles.climberInfo}>
													<strong>{b.name}</strong>
													<span>Debuts at No. {b.rank}</span>
												</span>
												<Movement move={null} compact />
											</a>
										</Link>
									</li>
								))}
							</ul>
						</section>
					)}
				</div>

				<p className={Styles.method}>
					<FlameIcon size={14} /> Ranked by readers this week. Movement compares each book with its
					position in last week&apos;s chart.
				</p>
			</div>
		</Layout>
	);
}

export async function getServerSideProps() {
	await db.connect();
	const products = await Product.find().lean();
	return { props: { products: products.map(db.convertDoctoObj) } };
}
