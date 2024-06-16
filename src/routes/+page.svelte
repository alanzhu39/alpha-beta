<script>
	import ReferenceBetaFlow from './ReferenceBetaFlow.svelte';
	import UserBetaFlow from './UserBetaFlow.svelte';
</script>

<div class="layout">
	<h1 style="grid-area: header;">Welcome to AlphaBeta!</h1>
	<UserBetaFlow />
	<ReferenceBetaFlow />
</div>

<style>
	:global(body) {
		--green: #1db954;

		margin: 0;
		padding: 0;
	}

	.layout {
		width: 100vw;
		height: 100vh;
		display: grid;
		grid-template:
			'header header' auto
			'left right' minmax(0, 1fr)
			/ 1fr 1fr;
	}

	h1 {
		margin: 0;
	}
</style>
